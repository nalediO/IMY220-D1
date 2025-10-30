// routes/admin.js
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const User = require("../models/User");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/projects", auth, admin, async (req, res) => {
  const projects = await Project.find().populate("owner members");
  res.json(projects);
});

router.put("/projects/:id", auth, admin, async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
});

router.delete("/projects/:id", auth, admin, async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json({ message: "Project deleted successfully" });
});

router.get("/users", auth, admin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.put("/users/:id", auth, admin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

router.delete("/users/:id", auth, admin, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted successfully" });
});

router.put("/users/:id/verify", auth, admin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User verified successfully", user });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        role: user.role,          // <-- ADD THIS
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router; 