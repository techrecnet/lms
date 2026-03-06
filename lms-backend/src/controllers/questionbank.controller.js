const QuestionBank = require('../models/QuestionBank');

exports.list = async (req, res) => {
  const { courseId, type, level, keyword } = req.query;
  const filter = {};
  
  if (courseId) filter.courseId = courseId;
  if (type) filter.type = type;
  if (level) filter.level = level;
  if (keyword) filter.keywords = { $in: [keyword] };

  const items = await QuestionBank.find(filter)
    .populate('courseId', 'title')
    .sort({ createdAt: -1 });
  res.json(items);
};

exports.getById = async (req, res) => {
  const item = await QuestionBank.findById(req.params.id).populate('courseId');
  if (!item) return res.status(404).json({ msg: 'Not found' });
  res.json(item);
};

exports.create = async (req, res) => {
  const question = await QuestionBank.create(req.body);
  res.json(question);
};

exports.update = async (req, res) => {
  const question = await QuestionBank.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('courseId');
  if (!question) return res.status(404).json({ msg: 'Not found' });
  res.json(question);
};

exports.remove = async (req, res) => {
  await QuestionBank.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
};

exports.exportCsv = async (req, res) => {
  const items = await QuestionBank.find().populate('courseId', 'title');
  res.json(items);
};
