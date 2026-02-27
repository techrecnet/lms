const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  completedLibraryTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TopicLibrary' }],
  completedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' }],
  completedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  lastCheckedIn: { type: Date, default: Date.now },
  quizResults: [{
    section: mongoose.Schema.Types.ObjectId,
    score: Number,
    passed: Boolean
  }]
}, { timestamps: true });

progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
