const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  projectType: { type: String, required: false },
  hashtags: [String],
  currentVersion: { type: String, default: '1.0.0' },
  isCheckedOut: { type: Boolean, default: false },
  checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: String,
  files: [{
    originalName: String,   
    storedName: String,      
    fileUrl: String,        
    mimetype: String,        
    uploadDate: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
