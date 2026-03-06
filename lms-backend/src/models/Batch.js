const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  certificateAllowed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
