const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logoUrl: String,
  address: String,
  state: String,
  city: String,
  type: { type: String },
  typeOther: String,
  phone: String,
  email: String,
  website: String,
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

module.exports = mongoose.model('Institute', instituteSchema);
