const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  rollNo: String,
  batchSession: String,
  class: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  institute: String,
  instituteType: String,
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
  studentImage: String,
  registrationNo: String,
  role: { type: String, enum: ['admin', 'user', 'mentor'], default: 'user' },
  isActive: { type: Boolean, default: true },
  assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
