const Quiz = require('../models/Quiz');

exports.list = async (req, res) => {
  const items = await Quiz.find().populate('section').sort({ createdAt: -1 });
  res.json(items);
};

exports.getById = async (req, res) => {
  const item = await Quiz.findById(req.params.id).populate('section');
  if (!item) return res.status(404).json({ msg: 'Not found' });
  res.json(item);
};

exports.create = async (req, res) => {
  const item = await Quiz.create(req.body);
  res.json(item);
};

exports.update = async (req, res) => {
  const item = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ msg: 'Not found' });
  res.json(item);
};

exports.remove = async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
};
