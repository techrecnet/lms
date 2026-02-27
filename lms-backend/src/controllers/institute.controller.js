const Institute = require('../models/Institute');

exports.list = async (req, res) => {
  const { name, type, state, city } = req.query;
  const filter = {};
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (type) filter.type = type;
  if (state) filter.state = { $regex: state, $options: 'i' };
  if (city) filter.city = { $regex: city, $options: 'i' };

  const items = await Institute.find(filter).sort({ createdAt: -1 });
  res.json(items);
};

exports.getById = async (req, res) => {
  const item = await Institute.findById(req.params.id).populate('courses');
  if (!item) return res.status(404).json({ msg: 'Not found' });
  res.json(item);
};

exports.create = async (req, res) => {
  const data = {
    ...req.body,
    logoUrl: req.file ? `/uploads/institutes/${req.file.filename}` : req.body.logoUrl
  };
  const item = await Institute.create(data);
  res.json(item);
};

exports.update = async (req, res) => {
  const updates = {
    ...req.body
  };
  if (req.file) updates.logoUrl = `/uploads/institutes/${req.file.filename}`;

  const item = await Institute.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ msg: 'Not found' });
  res.json(item);
};

exports.assignCourseToInstitute = async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ msg: 'courseId required' });
  await Institute.findByIdAndUpdate(req.params.id, { $addToSet: { courses: courseId } });
  res.json({ msg: 'Course assigned to institute' });
};

exports.removeCourseFromInstitute = async (req, res) => {
  const courseId = req.params.courseId;
  await Institute.findByIdAndUpdate(req.params.id, { $pull: { courses: courseId } });
  res.json({ msg: 'Course removed from institute' });
};

exports.remove = async (req, res) => {
  await Institute.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
};
