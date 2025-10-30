const express = require('express');
const Checkin = require('../models/Checkin');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/checkins');
  },
  
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post('/', auth, upload.array('files'), async (req, res) => {
  try {
    const { projectId, message, version } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember =
      project.members.some(
        (memberId) => memberId.toString() === req.user._id.toString()
      ) || project.owner.toString() === req.user._id.toString();

    if (!isMember) {
      return res.status(403).json({ message: 'Not a member or owner of this project' });
    }

    const files = (req.files || []).map((file) => ({
      filename: file.originalname,
      fileUrl: `/uploads/checkins/${file.filename}`,
    }));

    const checkin = new Checkin({
      project: projectId,
      user: req.user._id,
      message,
      version,
      files,
    });

    await checkin.save();

    if (version) project.currentVersion = version;
    project.isCheckedOut = false;
    project.checkedOutBy = null;
    await project.save();

    res.status(201).json(checkin);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const checkins = await Checkin.find({ project: req.params.projectId })
      .populate('user', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.json(checkins);
  } catch (err) {
    console.error('Fetch project checkins error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
