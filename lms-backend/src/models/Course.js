const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  duration: String,
  prerequisites: String,
  outcomes: String,
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  isLockedSequentially: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
