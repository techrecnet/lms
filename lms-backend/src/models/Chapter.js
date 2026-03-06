const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  libraryTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TopicLibrary' }],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' }]
}, { timestamps: true });

module.exports = mongoose.model('Chapter', chapterSchema);
