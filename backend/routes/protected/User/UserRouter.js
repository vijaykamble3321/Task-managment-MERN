import { Router } from "express";
import TaskModel from "../../../models/TaskModel.js";
// import userModel from "../../../models/Usermodel.js";
import {
  errorResponse,
  successResponse,
} from "../../../utils/serverResponse.js";
import CommentModel from "../../../models/CommentModel.js";
import userModel from "../../../models/Usermodel.js";

const UserRouter = Router();

UserRouter.get("/gettask", getTaskController);
UserRouter.post("/commentuser", commentuserController);
UserRouter.get("/taskcomments", getTaskCommentsController);
UserRouter.delete("/deletecomment",deletecommentController)
UserRouter.put("/updatecomment",updateCommentController)
UserRouter.get("/viewprofile",viewprofileController)
UserRouter.put("/viewprofileuser",updatedTaskController)
UserRouter.get("/viewtaskdetail",viewtaskdetailController)



export default UserRouter;
//

async function viewtaskdetailController(req, res) {
  try {
    const { email, role } = res.locals;

    if (role !== "user") {
      return errorResponse(res, 403, "Access denied. You must be a user.");
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    // Fetch all tasks for the user
    const tasks = await TaskModel.find({ userId: user._id });

    if (tasks.length === 0) {
      return errorResponse(res, 404, "No tasks found for this user.");
    }

    // Calculate metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day

    const todayTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "completed").length;
    const pendingTasks = tasks.filter((task) => task.status === "pending").length;
    const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;

    // Prepare the response
    const response = {
      tasks, // All tasks
      metrics: {
        todayTasks: todayTasks.length, // Number of tasks due today
        totalTasks, // Total number of tasks
        completedTasks, // Number of completed tasks
        pendingTasks, // Number of pending tasks
        inProgressTasks, // Number of in-progress tasks
      },
    };

    return successResponse(res, "User's tasks retrieved successfully", response);
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return errorResponse(res, 500, "Internal server error");
  }
}






async function updatedTaskController(req, res) {
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


async function viewprofileController(req, res) {
  try {
    const { email, role } = res.locals;

    if (role !== "user") {
      return errorResponse(res, 403, "Access denied. You must be a user.");
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "user not found.");
    }

    return successResponse(res, "User profile retrieved successfully.", {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
   
    });
  } catch (error) {
    console.error("Error in getuserprofileController:", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}


async function updateCommentController(req, res) {
    try {
      const { commentId } = req.query;
      const { comment } = req.body;
  
      if (!commentId || !comment) {
        return errorResponse(res, 400, "Comment ID and new comment text are required");
      }
  
      const existingComment = await CommentModel.findById(commentId);
      if (!existingComment) {
        return errorResponse(res, 404, "Comment not found");
      }
  
      const updatedComment = await CommentModel.findByIdAndUpdate(
        commentId,
        { comment, updatedAt: new Date() },
        { new: true } 
      );
  
      return successResponse(res, "Comment updated successfully", updatedComment);
    } catch (error) {
      console.error("Error updating comment:", error);
      return errorResponse(res, 500, "Internal server error");
    }
  }
  
async function deletecommentController(req, res) {
    try {
      const { commentId } = req.query;
  
      if (!commentId) {
        return errorResponse(res, 400, "Comment ID is required");
      }
  
      const deletedComment = await CommentModel.findByIdAndDelete(commentId);
  
      if (!deletedComment) {
        return errorResponse(res, 404, "Comment not found");
      }
  
      return successResponse(res, "Comment deleted successfully", deletedComment);
    } catch (error) {
      console.error("Error deleting comment:", error);
      return errorResponse(res, 500, "Internal server error");
    }
  }
  


async function commentuserController(req, res) {
    try {
      console.log("Extracted userId from res.locals:", res.locals.userId);
  
      const { taskId, comment } = req.body;
      const { userId, role } = res.locals;
  
      if (!taskId || !comment) {
        return errorResponse(res, 400, "Task ID and comment are required");
      }
  
      if (!userId) {
        console.log("❌ userId is missing in res.locals");
        return errorResponse(res, 400, "User ID is required");
      }
  
      const newComment = new CommentModel({
        taskId,
        userId,
        role,
        comment,
      });
  
      await newComment.save();
  
      
      const savedComment = await CommentModel.findById(newComment._id)
        .select("taskId comment  createdAt"); 
  
      return successResponse(res, "Comment added successfully", savedComment);
    } catch (error) {
      console.error("_commentUserController_", error);
      return errorResponse(res, 500, "Internal server error");
    }
  }
  


async function getTaskCommentsController(req, res) {
  try {
    const { taskId } = req.query;

    const comments = await CommentModel.find({ taskId }).populate(
      "userId",
      "fname lname"
    );

    if (comments.length === 0) {
      return errorResponse(res, 404, "No comments found for this task.");
    }

    return successResponse( res,"Task comments retrieved successfully",comments );
  } catch (error) {
    console.error("_getTaskCommentsController_", error);
    return errorResponse(res, 500, "Internal server error");
  }
}

//

async function getTaskController(req, res) {
  try {
    const { email, role } = res.locals;

    if (role !== "user") {
      return errorResponse(res, 403, "Access denied. You must be a user.");
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const tasks = await TaskModel.find({ userId: user._id });

    if (tasks.length === 0) {
      return errorResponse(res, 404, "No tasks found for this user.");
    }

    return successResponse(res, "User's tasks retrieved successfully", tasks);
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return errorResponse(res, 500, "Internal server error");
  }
}
