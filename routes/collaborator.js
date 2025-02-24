const Collaborator = require("../models/Collaborator.models");
const ToDo = require("../models/ToDo.models");

const router = require("express").Router();

/**
 * POST /todos/:id/share
 * Share a task with another user.
 * Request body should include:
 *   - userId: ID of the user to share the task with
 *   - role : Role for the collaborator (default: "collaborator")
 */

router.post("/:id/share", async (req, res) => {
  try {
    const todoId = req.params.id;
    const { userId, role } = req.body;
    const creatorID = req.user._id;

    //check if task exists
    const todo = await ToDo.findById(todoId);
    if (!todo) {
      return res.status(404).json({ error: "Task doesn't exists." });
    }

    //only creator allowed to share the task
    if (todo.createdBy.toString() !== creatorID.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to share the task." });
    }

    // Create a new Collaborator record linking the task to the other user
    const newCollaborator = await Collaborator.create({
      task: todoId,
      user: userId,
      role: role,
    });

    await newCollaborator.save();

    res
      .status(201)
      .json({ message: "Task shared successfully.", newCollaborator });
  } catch (error) {
    res.status(500).json({ error: "Server error", error: error.message });
  }
});

/**
 * GET /todos/shared
 * Fetch tasks that have been shared with the logged-in user.
 */

router.get("/shared", async (req, res) => {
  try {
    // The logged-in user id is available via req.user (set by auth middleware)
    const userID = req.user._id;

    //find the shared task by userId then populate details by task : taskId
    const collaborations = await Collaborator.find({ user: userID }).populate(
      "task"
    );

    if (collaborations.length === 0) {
      return res.status(404).json({ error: "No tasks shared." });
    }

    res.status(200).json({ collaborations });
  } catch (error) {
    res.status(500).json({ error: "Server error", error: error.message });
  }
});

module.exports = router;
