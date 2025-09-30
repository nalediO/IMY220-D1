// routes/search.js
const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Checkin = require('../models/Checkin');
const auth = require('../middleware/auth');
const router = express.Router();

// Global search
router.get('/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const searchRegex = new RegExp(query, 'i');

    const [users, projects, checkins] = await Promise.all([
      // Search users
      User.find({
        $or: [
          { username: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ]
      }).select('username firstName lastName profileImage'),

      // Search projects
      Project.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { hashtags: { $in: [searchRegex] } },
          { projectType: searchRegex }
        ]
      }).populate('owner', 'username firstName lastName profileImage'),

      // Search checkins
      Checkin.find({
        message: searchRegex
      })
      .populate('user', 'username firstName lastName profileImage')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
    ]);

    res.json({ users, projects, checkins });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;