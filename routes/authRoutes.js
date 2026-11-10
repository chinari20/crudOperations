const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

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

// Register a user
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  checkValidation,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const normalizedEmail = email.toLowerCase();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword
      });

      res.status(201).json({
        message: "User registered successfully",
        user: { id: user._id, name: user.name, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ message: "Could not register user" });
    }
  }
);

// Login a user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  checkValidation,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: { id: user._id, name: user.name, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ message: "Could not log in" });
    }
  }
);

module.exports = router;
