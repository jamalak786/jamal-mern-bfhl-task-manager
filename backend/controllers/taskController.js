const Task = require('../models/Task');
const mongoose = require('mongoose');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, importance, dueDate, status } = req.body;

    // Manual pre-validation for bad types or missing required fields to return clean messages
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }
    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({ error: 'Title must be between 3 and 100 characters' });
    }
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string' });
    }
    if (description && description.length > 500) {
      return res.status(400).json({ error: 'Description cannot exceed 500 characters' });
    }

    if (importance === undefined || importance === null) {
      return res.status(400).json({ error: 'Importance is required' });
    }
    const impNum = Number(importance);
    if (!Number.isInteger(impNum) || impNum < 1 || impNum > 5) {
      return res.status(400).json({ error: 'Importance must be an integer between 1 and 5' });
    }

    if (!dueDate) {
      return res.status(400).json({ error: 'Due date is required' });
    }
    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ error: 'Invalid due date format' });
    }
    if (parsedDueDate <= new Date()) {
      return res.status(400).json({ error: 'Due date must be a future date' });
    }

    if (status && status !== 'pending' && status !== 'completed') {
      return res.status(400).json({ error: 'Status must be pending or completed' });
    }

    const task = new Task({
      title,
      description,
      importance: impNum,
      dueDate: parsedDueDate,
      status: status || 'pending'
    });

    await task.save();
    return res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// List all tasks, sorted by priorityScore DESC, supporting query filters
exports.getTasks = async (req, res) => {
  try {
    const { status, minImportance } = req.query;
    const filter = {};

    if (status) {
      if (status !== 'pending' && status !== 'completed') {
        return res.status(400).json({ error: 'Invalid status filter. Must be pending or completed' });
      }
      filter.status = status;
    }

    if (minImportance !== undefined) {
      const importanceVal = Number(minImportance);
      if (isNaN(importanceVal)) {
        return res.status(400).json({ error: 'minImportance must be a number' });
      }
      filter.importance = { $gte: importanceVal };
    }

    const tasks = await Task.find(filter);

    // Sort in-memory because priorityScore is a virtual property calculated at read-time
    tasks.sort((a, b) => b.priorityScore - a.priorityScore);

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update a task (any subset of editable fields, including status)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Task ID format' });
    }

    const updates = req.body;
    
    // Validate edits if they exist in request body
    if (updates.title !== undefined) {
      if (typeof updates.title !== 'string' || updates.title.length < 3 || updates.title.length > 100) {
        return res.status(400).json({ error: 'Title must be between 3 and 100 characters' });
      }
    }
    if (updates.description !== undefined) {
      if (updates.description && (typeof updates.description !== 'string' || updates.description.length > 500)) {
        return res.status(400).json({ error: 'Description cannot exceed 500 characters' });
      }
    }
    if (updates.importance !== undefined) {
      const impNum = Number(updates.importance);
      if (!Number.isInteger(impNum) || impNum < 1 || impNum > 5) {
        return res.status(400).json({ error: 'Importance must be an integer between 1 and 5' });
      }
      updates.importance = impNum;
    }
    if (updates.dueDate !== undefined) {
      const parsedDueDate = new Date(updates.dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({ error: 'Invalid due date format' });
      }
      // Note: Requirements say "must be a future date on creation". It doesn't strictly say it has to be future on UPDATE, 
      // but let's allow updating to a future date if they do change the date.
      if (parsedDueDate <= new Date()) {
        return res.status(400).json({ error: 'Due date must be a future date' });
      }
      updates.dueDate = parsedDueDate;
    }
    if (updates.status !== undefined) {
      if (updates.status !== 'pending' && updates.status !== 'completed') {
        return res.status(400).json({ error: 'Status must be pending or completed' });
      }
    }

    // Find and update
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Apply updates manually to trigger schema validations if any
    Object.keys(updates).forEach(key => {
      task[key] = updates[key];
    });

    await task.save();
    return res.status(200).json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a task by ID
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Task ID format' });
    }

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get aggregate analytics using MongoDB aggregation pipeline
exports.getStats = async (req, res) => {
  try {
    const statsResult = await Task.aggregate([
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                pendingTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                completedTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                averageImportance: { $avg: '$importance' },
                overdueTasks: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ['$status', 'pending'] },
                          { $lt: ['$dueDate', new Date()] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          tasksByImportance: [
            {
              $group: {
                _id: '$importance',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const defaultStats = {
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      averageImportance: 0,
      overdueTasks: 0,
      tasksByImportance: {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0
      }
    };

    if (!statsResult || statsResult.length === 0 || statsResult[0].overall.length === 0) {
      return res.status(200).json(defaultStats);
    }

    const overall = statsResult[0].overall[0];
    const importanceList = statsResult[0].tasksByImportance;

    const tasksByImportance = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    importanceList.forEach(item => {
      if (item._id >= 1 && item._id <= 5) {
        tasksByImportance[item._id.toString()] = item.count;
      }
    });

    return res.status(200).json({
      totalTasks: overall.totalTasks || 0,
      pendingTasks: overall.pendingTasks || 0,
      completedTasks: overall.completedTasks || 0,
      averageImportance: overall.averageImportance ? Number(overall.averageImportance.toFixed(2)) : 0,
      overdueTasks: overall.overdueTasks || 0,
      tasksByImportance
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
