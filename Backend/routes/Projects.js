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
        originalName: f.originalname,
        storedName: f.filename,
        fileUrl: `/uploads/${f.filename}`,
        mimetype: f.mimetype,
      })),
      imageUrl: req.files['image']
        ? `/uploads/${req.files['image'][0].filename}`
        : undefined,
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
router.put('/:id', auth, projectUpload, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Project ID required' });

    const updatesRaw = req.body.project
      ? JSON.parse(req.body.project)
      : req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (updatesRaw.title) project.name = updatesRaw.title.trim();
    if (updatesRaw.description) project.description = updatesRaw.description.trim();
    if (updatesRaw.version) project.currentVersion = updatesRaw.version.trim();
    if (Array.isArray(updatesRaw.hashtags)) project.hashtags = updatesRaw.hashtags;

    // Preserve old files
    project.files = project.files || [];
    if (updatesRaw.files) project.files = updatesRaw.files;

    // Add new uploaded files
    if (req.files?.files?.length) {
      const newFiles = req.files.files.map(f => ({
        originalName: f.originalname,
        storedName: f.filename,
        fileUrl: `/uploads/${f.filename}`,
        mimetype: f.mimetype,
      }));
      project.files = project.files.concat(newFiles);
    }

    if (req.files?.image?.length) {
      project.imageUrl = `/uploads/${req.files.image[0].filename}`;
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

// ----------------- CHECKOUT -----------------
router.put('/:id/checkout', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.isCheckedOut && String(project.checkedOutBy) !== String(req.user._id)) {
      return res.status(400).json({ message: 'Already checked out by another user' });
    }

    project.isCheckedOut = true;
    project.checkedOutBy = req.user._id;
    project.checkedOutAt = new Date();
    await project.save();

    res.json({ message: 'Project checked out', project });
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

    if (!project.isCheckedOut || String(project.checkedOutBy) !== String(req.user._id)) {
      return res.status(400).json({ message: 'Not checked out by you' });
    }

    const uploadedFiles = (req.files || []).map(f => ({
      originalName: f.originalname,
      storedName: f.filename,
      fileUrl: `/uploads/${f.filename}`,
      mimetype: f.mimetype,
    }));

    const checkin = new Checkin({
      project: project._id,
      user: req.user._id,
      message,
      version: version || project.currentVersion,
      files: uploadedFiles,
    });
    await checkin.save();

    project.isCheckedOut = false;
    project.checkedOutBy = null;
    project.checkedOutAt = null;
    if (version) project.currentVersion = version;

    uploadedFiles.forEach(newFile => {
      const idx = project.files.findIndex(f => f.originalName === newFile.originalName);
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

// ----------------- DELETE FILE FROM PROJECT -----------------
router.delete('/:id/files/:storedName', auth, async (req, res) => {
  try {
    const { id, storedName } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // remove file from project.files array
    project.files = project.files.filter(f => f.storedName !== storedName);
    await project.save();

    // delete from uploads folder too
    const filePath = path.join(__dirname, '..', 'uploads', storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'File deleted', project });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- UPDATE SINGLE FILE -----------------
router.put('/:id/files/:storedName', auth, upload.single('file'), async (req, res) => {
  try {
    const { id, storedName } = req.params;
    console.log('Params:', req.params);
    console.log('Uploaded file:', req.file);

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileIndex = project.files.findIndex(f => f.storedName === storedName);
    if (fileIndex === -1) return res.status(404).json({ message: 'File not found in project' });

    // Preserve original name if user didn’t change it
    const existingFile = project.files[fileIndex];
    const newOriginalName = (req.file.originalname === existingFile.originalName)
      ? existingFile.originalName
      : req.file.originalname;

    // Replace file info
    project.files[fileIndex] = {
      originalName: newOriginalName,
      storedName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      uploadDate: new Date()
    };

    await project.save();

    // Delete old file from disk
    const oldFilePath = path.join(__dirname, '..', 'uploads', storedName);
    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

    res.json({ message: 'File updated successfully', project });
  } catch (err) {
    console.error('Update file error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ----------------- DOWNLOAD FILE -----------------
router.get('/:id/files/:storedName/download', auth, async (req, res) => {
  try {
    const { storedName } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', storedName);

    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    } else {
      return res.status(404).json({ message: 'File not found' });
    }
  } catch (err) {
    console.error('Download file error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
