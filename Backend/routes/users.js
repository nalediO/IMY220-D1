const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

//  Search users first — more specific route
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('username firstName lastName profileImage');
    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  Get all users (except logged-in user)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//  Get one user by ID
router.get('/:id', async (req, res) => {
  try {

    const id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {

      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {

      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {

    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//  Update profile
router.put('/:id', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = {};
    const fields = ['firstName', 'lastName', 'username', 'email', 'bio', 'birthday'];

    fields.forEach(field => {
      if (req.body[field]) updates[field] = req.body[field];
    });

    if (req.file) {
      updates.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
