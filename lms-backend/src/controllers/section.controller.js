const Section = require('../models/Section');
const Topic = require('../models/Topic');
const Course = require('../models/Course');

exports.createTopic = async (req, res) => {
  const sectionId = req.params.sectionId;
  const count = await Topic.countDocuments({ section: sectionId });
  const topic = await Topic.create({
    section: sectionId,
    title: req.body.title,
    order: req.body.order ?? count + 1,
    contentType: req.body.contentType ?? 'text',
    content: req.body.content ?? '',
    pdf: req.body.pdf ?? ''
  });
  await Section.findByIdAndUpdate(sectionId, { $push: { topics: topic._id } });
  res.json(topic);
};

exports.deleteSection = async (req, res) => {
  const sectionId = req.params.sectionId;
  const section = await Section.findById(sectionId);
  if (!section) return res.status(404).json({ msg: 'Not found' });

  await Topic.deleteMany({ section: sectionId });
  await Course.findByIdAndUpdate(section.course, { $pull: { sections: sectionId } });
  await Section.findByIdAndDelete(sectionId);

  res.json({ msg: 'Deleted' });
};

exports.reorderTopics = async (req, res) => {
  const sectionId = req.params.sectionId;
  const topicIds = req.body.topicIds;
  if (!Array.isArray(topicIds)) return res.status(400).json({ msg: 'topicIds array required' });

  await Topic.bulkWrite(
    topicIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, section: sectionId },
        update: { order: index + 1 }
      }
    }))
  );

  await Section.findByIdAndUpdate(sectionId, { topics: topicIds });
  res.json({ msg: 'Reordered' });
};

exports.moveTopic = async (req, res) => {
  const { sectionId, topicId } = req.params;
  const { targetSectionId, targetIndex } = req.body;

  if (!targetSectionId) return res.status(400).json({ msg: 'targetSectionId required' });

  try {
    // Get both sections
    const sourceSection = await Section.findById(sectionId);
    const targetSection = await Section.findById(targetSectionId);

    if (!sourceSection || !targetSection) {
      return res.status(404).json({ msg: 'Section not found' });
    }

    // Update the topic's section reference
    await Topic.findByIdAndUpdate(topicId, { section: targetSectionId });

    // Remove topic from source section
    await Section.findByIdAndUpdate(sectionId, { $pull: { topics: topicId } });

    // Get updated source section to reorder remaining topics
    const updatedSource = await Section.findById(sectionId);
    if (updatedSource && updatedSource.topics) {
      await Topic.bulkWrite(
        updatedSource.topics.map((id, index) => ({
          updateOne: {
            filter: { _id: id },
            update: { order: index + 1 }
          }
        }))
      );
    }

    // Add topic to target section at specified index
    const targetTopics = [...targetSection.topics];
    const insertIndex = targetIndex !== undefined ? targetIndex : targetTopics.length;
    targetTopics.splice(insertIndex, 0, topicId);

    await Section.findByIdAndUpdate(targetSectionId, { topics: targetTopics });

    // Reorder target section topics
    await Topic.bulkWrite(
      targetTopics.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: { order: index + 1 }
        }
      }))
    );

    res.json({ msg: 'Topic moved successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.addLibraryTopic = async (req, res) => {
  const { sectionId } = req.params;
  const { topicLibraryId } = req.body;

  if (!topicLibraryId) return res.status(400).json({ msg: 'topicLibraryId required' });

  try {
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { $addToSet: { libraryTopics: topicLibraryId } },
      { new: true, runValidators: true }
    ).populate('libraryTopics').populate('questions');

    if (!section) return res.status(404).json({ msg: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.removeLibraryTopic = async (req, res) => {
  const { sectionId, topicLibraryId } = req.params;

  try {
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { libraryTopics: topicLibraryId } },
      { new: true, runValidators: true }
    ).populate('libraryTopics').populate('questions');

    if (!section) return res.status(404).json({ msg: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.reorderLibraryTopics = async (req, res) => {
  const sectionId = req.params.sectionId;
  const topicIds = req.body.topicIds;
  if (!Array.isArray(topicIds)) return res.status(400).json({ msg: 'topicIds array required' });

  try {
    await Section.findByIdAndUpdate(sectionId, { libraryTopics: topicIds });
    res.json({ msg: 'Reordered' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.moveLibraryTopic = async (req, res) => {
  const { sectionId, topicLibraryId } = req.params;
  const { targetSectionId, targetIndex } = req.body;

  if (!targetSectionId) return res.status(400).json({ msg: 'targetSectionId required' });

  try {
    // Get both sections
    const sourceSection = await Section.findById(sectionId);
    const targetSection = await Section.findById(targetSectionId);

    if (!sourceSection || !targetSection) {
      return res.status(404).json({ msg: 'Section not found' });
    }

    // Remove library topic from source section
    await Section.findByIdAndUpdate(sectionId, { $pull: { libraryTopics: topicLibraryId } });

    // Add library topic to target section at specified index
    const targetLibraryTopics = [...(targetSection.libraryTopics || [])];
    const insertIndex = targetIndex !== undefined ? targetIndex : targetLibraryTopics.length;
    targetLibraryTopics.splice(insertIndex, 0, topicLibraryId);

    await Section.findByIdAndUpdate(targetSectionId, { libraryTopics: targetLibraryTopics });

    res.json({ msg: 'Library topic moved successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.addQuestion = async (req, res) => {
  const { sectionId } = req.params;
  const { questionId } = req.body;

  if (!questionId) return res.status(400).json({ msg: 'questionId required' });

  try {
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { $addToSet: { questions: questionId } },
      { new: true, runValidators: true }
    ).populate('libraryTopics').populate('questions');

    if (!section) return res.status(404).json({ msg: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.removeQuestion = async (req, res) => {
  const { sectionId, questionId } = req.params;

  try {
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { questions: questionId } },
      { new: true, runValidators: true }
    ).populate('libraryTopics').populate('questions');

    if (!section) return res.status(404).json({ msg: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
