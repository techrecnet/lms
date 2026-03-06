const Topic = require('../models/Topic');

exports.getById = async (req, res) => {
  const topic = await Topic.findById(req.params.topicId);
  if (!topic) return res.status(404).json({ msg: 'Not found' });
  res.json(topic);
};

exports.updateTopic = async (req, res) => {
  const updates = {
    title: req.body.title,
    content: req.body.content,
    contentType: req.body.contentType,
    pdf: req.body.pdf
  };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const topic = await Topic.findByIdAndUpdate(
    req.params.topicId,
    updates,
    { new: true, runValidators: true }
  );
  if (!topic) return res.status(404).json({ msg: 'Not found' });
  res.json(topic);
};
