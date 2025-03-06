
import mongoose, { model, Schema, Types } from "mongoose";

const commentSchema = new Schema(
  {
    taskId: {
      type:  mongoose.Schema.Types.ObjectId,
      ref: "task",
      required: true,
    },
    userId: {
        type:mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "superadmin"],
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const CommentModel = model("Comment", commentSchema);
export default CommentModel;
