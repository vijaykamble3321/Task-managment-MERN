import { Router } from "express";
import taskModel from "../../../models/TaskModel.js";
import {errorResponse,successResponse,} from "../../../utils/serverResponse.js";
import TaskModel from "../../../models/TaskModel.js";
import CommentModel from "../../../models/CommentModel.js";
import userModel from "../../../models/Usermodel.js";

const AdminTaskRouter = Router();

// Routes
AdminTaskRouter.get("/gettasks", getAllTasksController);
AdminTaskRouter.post("/createtask", createTaskController);
AdminTaskRouter.put("/update-tasks", updateTaskController);
AdminTaskRouter.delete("/delete-tasks", deleteTaskController);
AdminTaskRouter.get("/onetaskdetail", getTaskDetailsForAdmin);
AdminTaskRouter.get("/metrics", getMetricsController); // New

export default AdminTaskRouter;

// Controller to get metrics
async function getMetricsController(req, res) {
  try {
    // Fetch total tasks
    const totalTasks = await TaskModel.countDocuments();

    // Fetch total users
    const totalUsers = await userModel.countDocuments();

    // Fetch tasks by status
    const pendingTasks = await TaskModel.countDocuments({ status: "pending" });
    const inProgressTasks = await TaskModel.countDocuments({ status: "in-progress" });
    const completedTasks = await TaskModel.countDocuments({ status: "completed" });

    // Prepare the response
    const metrics = {
      totalTasks,
      totalUsers,
      pendingTasks,
      inProgressTasks,
      completedTasks,
    };

    return successResponse(res, "Metrics retrieved successfully", metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return errorResponse(res, 500, "Internal server error");
  }
}



async function getTaskDetailsForAdmin(req, res) {
    try {
        const { userId } = req.query; 
    
        if (!userId) {
          return errorResponse(res, 400, "User ID is required");
        }
    
        
        const tasks = await TaskModel.find({ userId });
    
        if (!tasks.length) {
          return errorResponse(res, 404, "No tasks found for this user.");
        }
    
        
        const taskIds = tasks.map(task => task._id);
    
        const comments = await CommentModel.find({ taskId: { $in: taskIds } })
          .populate("userId", "fname lname role");
    
        return successResponse(res, "User's tasks and comments retrieved successfully", {
          tasks,
          comments
        });
    
      } catch (error) {
        console.error("Error fetching tasks and comments:", error);
        return errorResponse(res, 500, "Internal server error");
      }
    }
  

// Controller to get all tasks
async function getAllTasksController(req, res) {
  try {
    const tasks = await taskModel.find();
    successResponse(res, "All tasks found", tasks);
  } catch (error) {
    errorResponse(res, 500, "Internal server error");
  }
}

// Controller to create a new task
async function createTaskController(req, res) {
  try {
    const { title, description, status, dueDate, userId } = req.body;
    if (!title || !description || !dueDate || !userId) {
      return errorResponse(res, 400, "All fileds are required");
    }

    const newTask = await taskModel.create({
      title,
      description,
      dueDate,
      userId,
      currentDate: new Date(),
      status: status || "pending",
    });
    successResponse(res, "Task created successfully", newTask);
  } catch (error) {
    errorResponse(res, 500, "Internal server error");
  }
}

// Controller to update a task
async function updateTaskController(req, res) {
    try {
      const id = req.query.id?.trim();
      const updateData = req.body;
  
      if (!id) {
        return errorResponse(res, 400, "id is not provided");
      }
  
      const updatedataUser = await TaskModel.findByIdAndUpdate(id, updateData);
      successResponse(res, "success", updatedataUser);
    } catch (error) {
      console.log("__getalluserController__", error);
      errorResponse(res, 500, "internal server error");
    }
  }

// Controller to delete a task
async function deleteTaskController(req, res) {
    try {
      const id = req.query.id?.trim();
  
      if (!id) {
        return errorResponse(res, 400, "id is not provided");
      }
      const deleteUser = await TaskModel.findByIdAndDelete(id);
  
      successResponse(res, "success", deleteUser);
    } catch (error) {
      console.log("__getalluserController__", error);
      errorResponse(res, 500, "internal server error");
    }
  }
  







