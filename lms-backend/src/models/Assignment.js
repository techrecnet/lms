const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  submissionLink: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
