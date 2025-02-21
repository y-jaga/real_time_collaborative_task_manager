const mongoose = require("mongoose");

// This model handles the relationship between tasks and users when tasks are shared or when multiple users are collaborating on a single task.
// task: References the specific To-Do List item.
// user: References the User who is collaborating on the task.
// role: Defines what the collaborator can do (e.g., "owner", "collaborator", or "viewer").
const CollaboratorSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ToDo",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "collaborator", "viewer"],
      default: "collaborator",
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Collaborator = mongoose.model("Collaborator", CollaboratorSchema);

module.exports = Collaborator;
