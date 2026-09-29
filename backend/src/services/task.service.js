const { query } = require("../config/db");
const ApiError = require("../utils/apiError");

class TaskService {
  /**
   * Get all available default tasks/services
   */
  static async getAllTasks() {
    const res = await query("SELECT id, title, category, description, icon, price FROM tasks ORDER BY created_at ASC");
    return res.rows.map((row) => ({
      id: row.id,
      title: row.title,
      name: row.title,
      category: row.category,
      description: row.description,
      icon: row.icon,
      price: parseFloat(row.price || 0),
    }));
  }

  /**
   * Get selected tasks for a user
   */
  static async getUserTasks(userId) {
    const res = await query(
      `SELECT id, task_id, title, category, description, icon, status, scheduled_date, scheduled_time, created_at
       FROM user_tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return res.rows.map((row) => ({
      id: row.id,
      taskId: row.task_id,
      title: row.title,
      category: row.category,
      description: row.description,
      icon: row.icon,
      status: row.status,
      scheduledDate: row.scheduled_date || "Today",
      scheduledTime: row.scheduled_time || "10:00 AM",
      createdAt: row.created_at,
    }));
  }

  /**
   * Select / Book a task for a user
   */
  static async selectTask(userId, taskData) {
    const taskId = taskData.id || taskData.taskId || `task-${Date.now()}`;
    const title = taskData.title || taskData.name || "Service Task";
    const category = taskData.category || "General";
    const description = taskData.description || "";
    const icon = taskData.icon || "construct-outline";
    const status = taskData.status || "Scheduled";
    const scheduledDate = taskData.scheduledDate || "Today";
    const scheduledTime = taskData.scheduledTime || "10:00 AM";

    const insertQuery = `
      INSERT INTO user_tasks (user_id, task_id, title, category, description, icon, status, scheduled_date, scheduled_time, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, task_id, title, category, description, icon, status, scheduled_date, scheduled_time, created_at;
    `;

    const res = await query(insertQuery, [
      userId,
      taskId,
      title,
      category,
      description,
      icon,
      status,
      scheduledDate,
      scheduledTime,
    ]);

    const row = res.rows[0];
    return {
      id: row.id,
      taskId: row.task_id,
      title: row.title,
      category: row.category,
      description: row.description,
      icon: row.icon,
      status: row.status,
      scheduledDate: row.scheduled_date,
      scheduledTime: row.scheduled_time,
      createdAt: row.created_at,
    };
  }

  /**
   * Remove / Cancel a task selection
   */
  static async removeUserTask(userId, userTaskId) {
    const res = await query(
      "DELETE FROM user_tasks WHERE id = $1 AND user_id = $2 RETURNING id",
      [userTaskId, userId]
    );

    if (res.rows.length === 0) {
      throw new ApiError(404, "Task not found or not authorized.");
    }

    return { success: true, message: "Task removed successfully." };
  }
}

module.exports = TaskService;
