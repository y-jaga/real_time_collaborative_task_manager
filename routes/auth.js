const User = require("../models/User.models");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// "username" : "yogesh", "jaga", "deepkia"
//  "email" : "yogeshjaga123@gmail.com", "jagayogesh4556@gmail.com", "deepikaxj4@gmail.com"
// "password" : "yogesh123", "jaga123", "deepkia123"

//Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "All fields are required username, email, password" });
    }
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists. Please login" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", username });
  } catch (error) {
    res.status(500).json({ error: "Server error.", error: error });
  }
});

//Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found. Please register" });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "4h" });
    res
      .status(201)
      .json({ message: "Login successfull", token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: "Server error while login.", error: error });
  }
});

module.exports = router;
