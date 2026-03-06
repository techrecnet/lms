const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  libraryTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TopicLibrary' }],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' }],
  quizRequired: { type: Boolean, default: false },
  completionRequired: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);
