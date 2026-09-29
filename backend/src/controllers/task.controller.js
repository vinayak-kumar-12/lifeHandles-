const TaskService = require("../services/task.service");
const sendResponse = require("../utils/apiResponse");

class TaskController {
  /**
   * GET /api/tasks
   */
  static async getAllTasks(req, res, next) {
    try {
      const tasks = await TaskService.getAllTasks();
      return sendResponse(res, 200, "Tasks retrieved successfully.", { tasks });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/user
   */
  static async getUserTasks(req, res, next) {
    try {
      const userTasks = await TaskService.getUserTasks(req.user.id);
      return sendResponse(res, 200, "User tasks retrieved successfully.", { tasks: userTasks });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tasks/select
   */
  static async selectTask(req, res, next) {
    try {
      const task = await TaskService.selectTask(req.user.id, req.body);
      return sendResponse(res, 201, "Task selected successfully.", { task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/user/:id
   */
  static async removeUserTask(req, res, next) {
    try {
      const result = await TaskService.removeUserTask(req.user.id, req.params.id);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
