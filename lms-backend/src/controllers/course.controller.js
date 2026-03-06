const Course = require('../models/Course');
const Section = require('../models/Section');
const Topic = require('../models/Topic');

exports.createCourse = async (req, res) => {
  const data = {
    title: req.body.title,
    description: req.body.description,
    duration: req.body.duration,
    prerequisites: req.body.prerequisites,
    outcomes: req.body.outcomes,
    imageUrl: req.file ? `/uploads/courses/${req.file.filename}` : req.body.imageUrl
  };
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
  const course = await Course.create(data);
  res.json(course);
};

exports.getCourses = async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  const courseIds = courses.map(c => c._id);

  const sections = await Section.find({ course: { $in: courseIds } });

  const sectionCountMap = new Map();
  sections.forEach((s) => {
    const key = String(s.course);
    sectionCountMap.set(key, (sectionCountMap.get(key) || 0) + 1);
  });

  const payload = courses.map((c) => ({
    ...c.toObject(),
    sectionCount: sectionCountMap.get(String(c._id)) || 0
  }));

  res.json(payload);
};

exports.getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: 'sections',
      options: { sort: { order: 1 } },
      populate: [
        { path: 'topics', options: { sort: { order: 1, createdAt: 1 } } },
        { path: 'libraryTopics' },
        { path: 'questions', populate: { path: 'courseId' } }
      ]
    });
  if (!course) return res.status(404).json({ msg: 'Not found' });
  res.json(course);
};

exports.deleteCourse = async (req, res) => {
  const id = req.params.id;
  // cascade delete: sections -> topics
  const sections = await Section.find({ course: id });
  const sectionIds = sections.map(s => s._id);

  await Topic.deleteMany({ section: { $in: sectionIds } });
  await Section.deleteMany({ course: id });
  await Course.findByIdAndDelete(id);

  res.json({ msg: 'Deleted' });
};

exports.updateCourse = async (req, res) => {
  const updates = {
    title: req.body.title,
    description: req.body.description,
    duration: req.body.duration,
    prerequisites: req.body.prerequisites,
    outcomes: req.body.outcomes
  };
  if (req.file) updates.imageUrl = `/uploads/courses/${req.file.filename}`;
  if (!req.file && typeof req.body.imageUrl === 'string') updates.imageUrl = req.body.imageUrl;
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );
  if (!course) return res.status(404).json({ msg: 'Not found' });
  res.json(course);
};

// nested create: POST /courses/:id/sections
exports.addSectionToCourse = async (req, res) => {
  const courseId = req.params.id;
  const count = await Section.countDocuments({ course: courseId });
  const section = await Section.create({
    course: courseId,
    title: req.body.title,
    order: req.body.order ?? count + 1,
    quizRequired: !!req.body.quizRequired,
    completionRequired: req.body.completionRequired ?? true
  });
  await Course.findByIdAndUpdate(courseId, { $push: { sections: section._id } });
  res.json(section);
};

exports.reorderSections = async (req, res) => {
  const courseId = req.params.id;
  const sectionIds = req.body.sectionIds;
  if (!Array.isArray(sectionIds)) return res.status(400).json({ msg: 'sectionIds array required' });

  await Section.bulkWrite(
    sectionIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, course: courseId },
        update: { order: index + 1 }
      }
    }))
  );

  await Course.findByIdAndUpdate(courseId, { sections: sectionIds });
  res.json({ msg: 'Reordered' });
};
