const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  contentType: { type: String, enum: ['text', 'video'], default: 'text' },
  content: { type: String, default: '' },
  pdf: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
