const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number
  }],
  passingMarks: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
