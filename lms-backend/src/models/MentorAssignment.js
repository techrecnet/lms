const mongoose = require('mongoose');

const mentorAssignmentSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }]
}, { timestamps: true });

mentorAssignmentSchema.index({ batch: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('MentorAssignment', mentorAssignmentSchema);
