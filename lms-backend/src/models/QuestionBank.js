const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['MCQ', 'Subjective'], required: true },
  level: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  keywords: [String],
  explanation: String,
  // For MCQ
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  // For Subjective
  sampleAnswer: String
}, { timestamps: true });

module.exports = mongoose.model('QuestionBank', questionBankSchema);
