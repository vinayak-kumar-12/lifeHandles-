const express = require("express");
const router = express.Router();

const TaskController = require("../controllers/task.controller");
const authenticateJWT = require("../middlewares/auth.middleware");

// Public tasks listing
router.get("/", TaskController.getAllTasks);

// Protected user tasks endpoints
router.get("/user", authenticateJWT, TaskController.getUserTasks);
router.post("/select", authenticateJWT, TaskController.selectTask);
router.delete("/user/:id", authenticateJWT, TaskController.removeUserTask);

module.exports = router;
