const ToDo = require("../models/ToDo.models");
const router = require("express").Router();

//POST /todos
//Create a new task
router.post("/", async (req, res) => {
  const { title, status, createdBy, assignedUser } = req.body;
  try {
    if (!title || !createdBy) {
      return res
        .status(400)
        .json({ error: "Missing required field title and createdby." });
    }

    const newTodo = await ToDo.create({
      title,
      status,
      createdBy,
      assignedUser: assignedUser || [],
    });

    await newTodo.save();

    res.status(200).json({ message: "Todo created successfully", newTodo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET /todos
 * Fetch all tasks related to the logged-in user.
 * This includes tasks created by the user as well as tasks where the user is assigned.
 */

router.get("/", async (req, res) => {
  try {
    // Assume req.user is set by your auth middleware (e.g., using JWT)
    const userId = req.user._id;

    //Fetch tasks where the user is either the creator or is assigned
    const todos = await ToDo.find({
      $or: [{ createdBy: userId }, { assignedUser: userId }],
    });

    if (todos.length === 0) {
      return res.status(404).json({ error: "No tasks assigned or created." });
    }

    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * PUT /todos/:id
 * Update a task (e.g., update title, status, etc).
 * Add permission checks to ensure that only authorized(creator) users update the task.
 */

router.put("/:id", async (req, res) => {
  try {
    const todoId = req.params.id;
    const updatedData = req.body;
    const userId = req.user._id;

    const todo = await ToDo.findById(todoId);

    if (!todo) {
      return res.status(404).json({ error: "Task not found." });
    }

    if (todo.createdBy.toString() !== userId.toString()) {
      return res.status(401).json({
        error:
          "Not authorized to update the task. Only tasks creators allowed to updated.",
      });
    }

    const updatedUser = await ToDo.findByIdAndUpdate(todoId, updatedData, {
      new: true,
    });

    res
      .status(201)
      .json({ message: "ToDo successfully updated.", updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Server error", error: error.message });
  }
});

/**
 * DELETE /todos/:id
 * Delete a task.
 * Only the creator of the task are allowed to delete it.
 */

router.delete("/:id", async (req, res) => {
  try {
    const todoId = req.params.id;
    const userId = req.user._id;

    const todo = await ToDo.findById(todoId);

    if (!todo) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Check if the logged-in user is the creator of the task
    if (todo.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete the task." });
    }

    await ToDo.findByIdAndDelete(todoId);
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: "Server error", error: error.message });
  }
});

module.exports = router;
