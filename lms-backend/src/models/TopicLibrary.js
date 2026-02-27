const mongoose = require('mongoose');

const topicLibrarySchema = new mongoose.Schema({
  courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  title: { type: String, required: true },
  content: String,
  audio: String,
  aiSummary: String
}, { timestamps: true });

module.exports = mongoose.model('TopicLibrary', topicLibrarySchema);
