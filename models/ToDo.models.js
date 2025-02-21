const mongoose = require("mongoose");

//This model represents individual tasks or to-do items.
//title: The name or description of the task.
//status: Tracks if the task is "pending", "in-progress", or "completed".
//createdBy: References the User who created the task.
//assignedUsers: An array of User IDs who are working on or are responsible for the task.
const ToDoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ToDo = mongoose.model("ToDo", ToDoSchema);

module.exports = ToDo;
