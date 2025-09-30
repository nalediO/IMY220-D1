// routes/projects.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const Checkin = require('../models/Checkin');
const auth = require('../middleware/auth');
const router = express.Router();



// ----------------- MULTER STORAGE -----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const projectUpload = upload.fields([
  { name: 'files', maxCount: 20 },
  { name: 'image', maxCount: 1 },
]);

const checkinUpload = upload.array('files', 20);

// ----------------- CREATE PROJECT -----------------
router.post('/', auth, projectUpload, async (req, res) => {
  try {
    const data = req.body.project ? JSON.parse(req.body.project) : req.body;

    const project = new Project({
      ...data,
      owner: req.user._id,
      members: [req.user._id],
      files: (req.files['files'] || []).map((f) => ({
        filename: f.originalname,
        fileUrl: f.path,
        mimetype: f.mimetype,
      })),
      imageUrl: req.files['image'] ? req.files['image'][0].path : undefined,
    });

    await project.save();

    await new Checkin({
      project: project._id,
      user: req.user._id,
      message: 'Project created',
      version: project.currentVersion,
      files: project.files,
    }).save();

    res.status(201).json(project);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- GET ALL PROJECTS -----------------
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'username firstName lastName profileImage')
      .populate('members', 'username firstName lastName profileImage');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- GET SINGLE PROJECT -----------------
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username firstName lastName profileImage')
      .populate('members', 'username firstName lastName profileImage')
      .populate('checkedOutBy', 'username firstName lastName profileImage');

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- UPDATE PROJECT -----------------
// Update project
router.put('/:id', auth, projectUpload, async (req, res) => {
  // 🟢 Log and validate incoming params
  console.log('PUT /projects params:', req.params);

  const { id } = req.params;

  // 🔒 Guard clause: stop if no valid ID
  if (!id || id === 'undefined') {
    return res.status(400).json({ message: 'Project ID is missing or invalid' });
  }

  try {
    const updatesRaw = req.body.project
      ? JSON.parse(req.body.project)
      : req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Map frontend fields
    if (updatesRaw.title !== undefined) project.name = updatesRaw.title.trim();
    if (updatesRaw.description !== undefined) project.description = updatesRaw.description.trim();
    if (updatesRaw.version !== undefined) project.currentVersion = updatesRaw.version.trim();
    if (Array.isArray(updatesRaw.hashtags)) project.hashtags = updatesRaw.hashtags;

    // Preserve existing files
    project.files = project.files || [];

    // Overwrite with filtered list if provided
    if (updatesRaw.files) project.files = updatesRaw.files;

    // Add new uploaded files
    if (req.files?.files?.length) {
      const newFiles = req.files.files.map(f => ({
        filename: f.originalname,
        fileUrl: f.path,
        mimetype: f.mimetype
      }));
      project.files = project.files.concat(newFiles);
    }

    // Replace image if uploaded
    if (req.files?.image?.length) {
      project.imageUrl = req.files.image[0].path;
    }

    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ----------------- DELETE PROJECT -----------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Checkin.deleteMany({ project: req.params.id });
    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- SEARCH -----------------
router.get('/search/:query', auth, async (req, res) => {
  try {
    const regex = new RegExp(req.params.query, 'i');
    const projects = await Project.find({
      $or: [
        { name: regex },
        { description: regex },
        { hashtags: { $in: [regex] } },
        { projectType: regex },
      ],
    }).populate('owner', 'username firstName lastName profileImage');

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- CHECKOUT & CHECKIN -----------------
router.post('/:id/checkout', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.isCheckedOut && project.checkedOutBy.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Already checked out by another user' });
    }

    project.isCheckedOut = true;
    project.checkedOutBy = req.user._id;
    project.checkedOutAt = new Date();
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- CHECKIN -----------------
router.post('/:id/checkin', auth, checkinUpload, async (req, res) => {
  try {
    const { message, version } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Ensure current user has checked out the project
    if (!project.isCheckedOut || project.checkedOutBy.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Not checked out by you' });
    }

    // Map uploaded files
    const uploadedFiles = (req.files || []).map(f => ({
      filename: f.originalname,
      fileUrl: f.path,
      mimetype: f.mimetype
    }));

    // Create the checkin
    const checkin = new Checkin({
      project: project._id,
      user: req.user._id,
      message,
      version: version || project.currentVersion,
      files: uploadedFiles
    });
    await checkin.save();

    // Update project files and release checkout
    project.isCheckedOut = false;
    project.checkedOutBy = null;
    project.checkedOutAt = null;
    if (version) project.currentVersion = version;

    // Merge uploaded files into project.files (replace if same filename)
    uploadedFiles.forEach(newFile => {
      const idx = project.files.findIndex(f => f.filename === newFile.filename);
      if (idx > -1) project.files[idx] = newFile;
      else project.files.push(newFile);
    });

    await project.save();

    res.json({ project, checkin });
  } catch (err) {
    console.error('Checkin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Checkout a project
router.put('/:id/checkout', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // check if already checked out
    if (project.isCheckedOut && String(project.checkedOutBy) !== String(req.user._id)) {
      return res.status(400).json({ message: 'Project already checked out by another user' });
    }

    project.isCheckedOut = true;
    project.checkedOutBy = req.user._id;
    await project.save();

    res.json({ message: 'Project checked out', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
