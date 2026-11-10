const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const Task = require("../models/Task");
const protect = require("../middleware/auth");

const router = express.Router();

function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((error) => error.msg)
    });
  }
  next();
}

function validTaskId(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }
  next();
}

// All task routes require a valid token.
router.use(protect);

// Create a task
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional().isString().withMessage("Description must be text"),
    body("status").optional().isIn(["pending", "in-progress", "completed"]).withMessage("Invalid status"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
    body("dueDate").optional({ nullable: true }).isISO8601().withMessage("Due date must be a valid date")
  ],
  checkValidation,
  async (req, res) => {
    try {
      const task = await Task.create({ ...req.body, user: req.userId });
      res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
      res.status(500).json({ message: "Could not create task" });
    }
  }
);

// Get all tasks belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch tasks" });
  }
});

// Get one task
router.get("/:id", validTaskId, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch task" });
  }
});

// Update a task
router.put(
  "/:id",
  validTaskId,
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().isString().withMessage("Description must be text"),
    body("status").optional().isIn(["pending", "in-progress", "completed"]).withMessage("Invalid status"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
    body("dueDate").optional({ nullable: true }).isISO8601().withMessage("Due date must be a valid date")
  ],
  checkValidation,
  async (req, res) => {
    try {
      const allowedFields = ["title", "description", "status", "priority", "dueDate"];
      const updates = {};

      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          updates[field] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Provide at least one valid field to update" });
      }

      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!task) return res.status(404).json({ message: "Task not found" });
      res.status(200).json({ message: "Task updated successfully", task });
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  }
);

// Delete a task
router.delete("/:id", validTaskId, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete task" });
  }
});

module.exports = router;
