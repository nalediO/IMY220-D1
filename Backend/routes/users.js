const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();


router.put('/:id', auth, upload.single('profileImage'), async (req, res) => {
  try {
    // Authorization check
    if (req.user._id.toString() !== req.params.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 🔥 Now multer has already parsed text + file into req.body + req.file
    const updates = {};

    // ✅ Extract text fields from form-data (multer puts them in req.body)
    if (req.body.firstName) updates.firstName = req.body.firstName;
    if (req.body.lastName) updates.lastName = req.body.lastName;
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.bio) updates.bio = req.body.bio;
    if (req.body.birthday) updates.birthday = req.body.birthday;

    // ✅ If file uploaded, update the image path
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

// GET all users
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔎 Search users (put this first!)
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// 👤 Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username firstName lastName profileImage');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// // ✏️ Update user profile
// router.put('/:id', auth, async (req, res) => {
//   try {
//     if (req.user._id.toString() !== req.params.id.toString()) {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     const updates = req.body;
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       updates,
//       { new: true, runValidators: true }
//     ).select('-password');

//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });




module.exports = router;

