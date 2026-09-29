import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { taskApi } from "../api";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "@padosipro_tasks_v2";

const INITIAL_TASKS = [
  {
    id: "home-cleaning",
    title: "Home Cleaning",
    category: "Home",
    description: "Professional cleaning service for your entire home",
    icon: "home-outline",
    status: "Scheduled",
    scheduledDate: "Today",
    scheduledTime: "10:00 AM",
    createdAt: new Date().toISOString(),
  },
  {
    id: "grocery-delivery",
    title: "Grocery Delivery",
    category: "Lifestyle",
    description: "Doorstep delivery from local neighborhood stores",
    icon: "cart-outline",
    status: "In Progress",
    scheduledDate: "Today",
    scheduledTime: "2:30 PM",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ac-service",
    title: "AC Service & Repair",
    category: "Home",
    description: "AC servicing, gas refill & cooling diagnostics",
    icon: "snow-outline",
    status: "Scheduled",
    scheduledDate: "Tomorrow",
    scheduledTime: "11:00 AM",
    createdAt: new Date().toISOString(),
  },
];

const ACTION_TYPES = {
  SET_TASKS: "SET_TASKS",
  ADD_TASK: "ADD_TASK",
  REMOVE_TASK: "REMOVE_TASK",
  UPDATE_TASK: "UPDATE_TASK",
  SET_TASK_STATUS: "SET_TASK_STATUS",
};

function taskReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_TASKS:
      return action.payload;

    case ACTION_TYPES.ADD_TASK: {
      const newTask = action.payload;
      const existingIndex = state.findIndex((t) => t.id === newTask.id || t.taskId === newTask.taskId);

      if (existingIndex >= 0) {
        const updated = [...state];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...newTask,
          status: newTask.status || "Scheduled",
        };
        return updated;
      }
      return [newTask, ...state];
    }

    case ACTION_TYPES.REMOVE_TASK:
      return state.filter((t) => t.id !== action.payload && t.taskId !== action.payload);

    case ACTION_TYPES.UPDATE_TASK:
      return state.map((t) =>
        t.id === action.payload.id || t.taskId === action.payload.id ? { ...t, ...action.payload.updates } : t
      );

    case ACTION_TYPES.SET_TASK_STATUS:
      return state.map((t) =>
        t.id === action.payload.id || t.taskId === action.payload.id ? { ...t, status: action.payload.status } : t
      );

    default:
      return state;
  }
}

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load user tasks & catalog from backend
  const refreshTasks = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch available catalog services
      try {
        const catalogRes = await taskApi.getAllTasks();
        const catalog = catalogRes.tasks || catalogRes.data?.tasks;
        if (Array.isArray(catalog) && catalog.length > 0) {
          setAvailableTasks(catalog);
        }
      } catch {
        // Fallback to local catalog if offline
      }

      // 2. Fetch user's booked tasks if authenticated
      if (isAuthenticated) {
        try {
          const userTasksRes = await taskApi.getUserTasks();
          const userTasksList = userTasksRes.tasks || userTasksRes.data?.tasks;
          if (Array.isArray(userTasksList)) {
            dispatch({ type: ACTION_TYPES.SET_TASKS, payload: userTasksList });
          }
        } catch {
          // Fallback to local storage if offline
        }
      }
    } finally {
      setIsRefreshing(false);
      setIsLoaded(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  // Sync state to AsyncStorage as offline backup
  useEffect(() => {
    if (!isLoaded) return;
    async function saveTasks() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        console.warn("Failed to save tasks to storage:", e);
      }
    }
    saveTasks();
  }, [tasks, isLoaded]);

  // Public API methods
  const addTask = async (taskData) => {
    const taskObj = {
      id: taskData.id || `task-${Date.now()}`,
      taskId: taskData.id || taskData.taskId,
      title: taskData.title || taskData.name || "Service Task",
      category: taskData.category || "General",
      description: taskData.description || "",
      icon: taskData.icon || "construct-outline",
      status: taskData.status || "Scheduled",
      scheduledDate: taskData.scheduledDate || "Today",
      scheduledTime: taskData.scheduledTime || "10:00 AM",
      createdAt: taskData.createdAt || new Date().toISOString(),
    };

    dispatch({ type: ACTION_TYPES.ADD_TASK, payload: taskObj });

    // Sync to PostgreSQL backend if authenticated
    if (isAuthenticated) {
      try {
        const res = await taskApi.selectTask(taskObj);
        const serverTask = res.task || res.data?.task;
        if (serverTask) {
          dispatch({ type: ACTION_TYPES.ADD_TASK, payload: serverTask });
        }
      } catch (e) {
        console.warn("Could not sync task selection to backend:", e.message);
      }
    }
  };

  const removeTask = async (taskId) => {
    dispatch({ type: ACTION_TYPES.REMOVE_TASK, payload: taskId });

    if (isAuthenticated) {
      try {
        await taskApi.removeUserTask(taskId);
      } catch (e) {
        console.warn("Could not remove task from backend:", e.message);
      }
    }
  };

  const updateTask = (taskId, updates) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_TASK,
      payload: { id: taskId, updates },
    });
  };

  const setTaskStatus = (taskId, status) => {
    dispatch({
      type: ACTION_TYPES.SET_TASK_STATUS,
      payload: { id: taskId, status },
    });
  };

  const isTaskSelected = (taskId) => {
    return tasks.some((t) => t.id === taskId || t.taskId === taskId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        availableTasks,
        isLoaded,
        isRefreshing,
        refreshTasks,
        addTask,
        removeTask,
        updateTask,
        setTaskStatus,
        isTaskSelected,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
