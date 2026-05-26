const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// All task routes served under the /bfhl prefix (handled in server.js, so paths here are relative to /bfhl/tasks)
router.route('/')
  .post(taskController.createTask)
  .get(taskController.getTasks);

router.route('/:id')
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
