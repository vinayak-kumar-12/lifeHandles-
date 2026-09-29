// ============================================================
//  PadosiPro - Task API Endpoints
// ============================================================

import { apiClient } from "./client";

export const taskApi = {
  /**
   * GET /tasks (all available default services)
   */
  getAllTasks: () => apiClient.get("/tasks"),

  /**
   * GET /tasks/user (user's selected / scheduled tasks)
   */
  getUserTasks: () => apiClient.get("/tasks/user"),

  /**
   * POST /tasks/select (book / select a service task)
   */
  selectTask: (taskData) => apiClient.post("/tasks/select", taskData),

  /**
   * DELETE /tasks/user/:id (remove a task booking)
   */
  removeUserTask: (userTaskId) => apiClient.delete(`/tasks/user/${userTaskId}`),
};
