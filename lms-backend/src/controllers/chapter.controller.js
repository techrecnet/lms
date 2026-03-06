const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');

exports.createTopic = async (req, res) => {
  const chapterId = req.params.chapterId;
  const count = await Topic.countDocuments({ chapter: chapterId });
  const topic = await Topic.create({
    chapter: chapterId,
    title: req.body.title,
    order: req.body.order ?? count + 1,
    contentType: req.body.contentType ?? 'text',
    content: req.body.content ?? '',
    pdf: req.body.pdf ?? ''
  });
  await Chapter.findByIdAndUpdate(chapterId, { $push: { topics: topic._id } });
  res.json(topic);
};

exports.updateChapter = async (req, res) => {
  const chapter = await Chapter.findByIdAndUpdate(
    req.params.chapterId,
    { title: req.body.title },
    { new: true, runValidators: true }
  );
  if (!chapter) return res.status(404).json({ msg: 'Not found' });
  res.json(chapter);
};

exports.reorderTopics = async (req, res) => {
  const chapterId = req.params.chapterId;
  const topicIds = req.body.topicIds;
  if (!Array.isArray(topicIds)) return res.status(400).json({ msg: 'topicIds array required' });

  await Topic.bulkWrite(
    topicIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, chapter: chapterId },
        update: { order: index + 1 }
      }
    }))
  );

  await Chapter.findByIdAndUpdate(chapterId, { topics: topicIds });
  res.json({ msg: 'Reordered' });
};

exports.addLibraryTopic = async (req, res) => {
  const { chapterId } = req.params;
  const { topicLibraryId } = req.body;

  if (!topicLibraryId) return res.status(400).json({ msg: 'topicLibraryId required' });

  try {
    const chapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $addToSet: { libraryTopics: topicLibraryId } },
      { new: true, runValidators: true }
    ).populate('libraryTopics').populate('questions');

    if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.removeLibraryTopic = async (req, res) => {
  const { chapterId, topicLibraryId } = req.params;

  try {
    const chapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $pull: { libraryTopics: topicLibraryId } },
      { new: true, runValidators: true }
    ).populate('libraryTopics').populate('questions');

    if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.addQuestion = async (req, res) => {
  const { chapterId } = req.params;
  const { questionId } = req.body;

  if (!questionId) return res.status(400).json({ msg: 'questionId required' });

  try {
    const chapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $addToSet: { questions: questionId } },
      { new: true, runValidators: true }
    ).populate('libraryTopics').populate('questions');

    if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.removeQuestion = async (req, res) => {
  const { chapterId, questionId } = req.params;

  try {
    const chapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $pull: { questions: questionId } },
      { new: true, runValidators: true }
    ).populate('libraryTopics').populate('questions');

    if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
