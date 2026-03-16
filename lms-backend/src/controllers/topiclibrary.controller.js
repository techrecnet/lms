// Bulk import topics (creates or upserts by title)
exports.bulkImport = async (req, res) => {
  let topics = [];
  if (req.body && Array.isArray(req.body)) {
    topics = req.body;
  } else if (req.body && typeof req.body === 'object' && req.body.topics) {
    topics = req.body.topics;
  } else {
    return res.status(400).json({ msg: 'Invalid data format. Expecting array of topics.' });
  }
  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ msg: 'No topics to import.' });
  }

  console.log('Bulk import received', topics.length, 'rows');

  const created = [];
  const updated = [];
  for (const t of topics) {
    if (!t.title) continue;
    try {
      // Upsert by title to avoid duplicates and ensure idempotency
      const doc = await TopicLibrary.findOneAndUpdate(
        { title: t.title },
        { $set: { content: t.content || '', aiSummary: t.aiSummary || '', courseIds: t.courseIds || [] } },
        { upsert: true, new: true }
      );
      // determine if newly created by checking createdAt vs updatedAt or by checking if provided content/summary changed
      // For simplicity, treat as created if it was recently created (no prior _id change detection here)
      created.push(doc);
    } catch (e) {
      console.error('Bulk import error for title=', t.title, e && e.message);
    }
  }

  res.json({ imported: created.length, topics: created });
};
const TopicLibrary = require('../models/TopicLibrary');
const { generateSummary } = require('../services/ai.service');

exports.list = async (req, res) => {
  const { courseId, topic } = req.query;
  const filter = {};
  if (courseId) filter.courseIds = { $in: [courseId] };
  if (topic) filter.title = { $regex: topic, $options: 'i' };

  const items = await TopicLibrary.find(filter)
    .populate('courseIds', 'title')
    .sort({ createdAt: -1 });
  res.json(items);
};

exports.getById = async (req, res) => {
  const item = await TopicLibrary.findById(req.params.id).populate('courseIds');
  if (!item) return res.status(404).json({ msg: 'Not found' });
  res.json(item);
};

exports.create = async (req, res) => {
  const data = { ...req.body };
  
  // Parse courseIds if it's a JSON string from FormData
  if (typeof data.courseIds === 'string') {
    try {
      data.courseIds = JSON.parse(data.courseIds);
    } catch (e) {
      data.courseIds = [data.courseIds];
    }
  }
  
  if (req.file) {
    data.audio = `/uploads/audios/${req.file.filename}`;
  }
  
  // Generate AI summary only if not manually provided and content exists
  if (!data.aiSummary && data.content) {
    const summary = await generateSummary(data.content);
    if (summary) {
      data.aiSummary = summary;
    }
  }
  
  const topic = await TopicLibrary.create(data);
  res.json(topic);
};

exports.update = async (req, res) => {
  const data = { ...req.body };
  
  // Parse courseIds if it's a JSON string from FormData
  if (typeof data.courseIds === 'string') {
    try {
      data.courseIds = JSON.parse(data.courseIds);
    } catch (e) {
      data.courseIds = [data.courseIds];
    }
  }
  
  if (req.file) {
    data.audio = `/uploads/audios/${req.file.filename}`;
  }
  
  // Generate AI summary only if not manually provided and content exists
  if (!data.aiSummary && data.content) {
    const existingTopic = await TopicLibrary.findById(req.params.id);
    if (!existingTopic || existingTopic.content !== data.content) {
      const summary = await generateSummary(data.content);
      if (summary) {
        data.aiSummary = summary;
      }
    }
  }
  
  const topic = await TopicLibrary.findByIdAndUpdate(
    req.params.id,
    data,
    { new: true, runValidators: true }
  ).populate('courseIds');
  if (!topic) return res.status(404).json({ msg: 'Not found' });
  res.json(topic);
};

exports.remove = async (req, res) => {
  await TopicLibrary.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
};
