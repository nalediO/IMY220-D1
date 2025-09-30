const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  version: String,
  files: [{
    filename: String,
    fileUrl: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Checkin', checkinSchema);