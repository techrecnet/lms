const Progress = require('../models/Progress');
const Course = require('../models/Course');

// Get or create progress for a user's course
exports.getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    let progress = await Progress.findOne({ user: userId, course: courseId });
    
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedTopics: [],
        completedLibraryTopics: [],
        completedQuestions: [],
        completedSections: [],
        lastCheckedIn: new Date()
      });
    } else {
      progress.lastCheckedIn = new Date();
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark a topic as complete
exports.markTopicComplete = async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const userId = req.user.id;

    let progress = await Progress.findOne({ user: userId, course: courseId });
    
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedTopics: [topicId],
        completedLibraryTopics: [],
        completedQuestions: [],
        completedSections: [],
        lastCheckedIn: new Date()
      });
    } else {
      if (!progress.completedTopics.includes(topicId)) {
        progress.completedTopics.push(topicId);
      }
    }

    // Check if section is complete
    await checkSectionCompletion(progress, courseId);

    progress.lastCheckedIn = new Date();
    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark a library topic as complete
exports.markLibraryTopicComplete = async (req, res) => {
  try {
    const { courseId, libraryTopicId } = req.params;
    const userId = req.user.id;

    let progress = await Progress.findOne({ user: userId, course: courseId });
    
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedTopics: [],
        completedLibraryTopics: [libraryTopicId],
        completedQuestions: [],
        completedSections: [],
        lastCheckedIn: new Date()
      });
    } else {
      if (!progress.completedLibraryTopics.includes(libraryTopicId)) {
        progress.completedLibraryTopics.push(libraryTopicId);
      }
    }

    // Check if section is complete
    await checkSectionCompletion(progress, courseId);

    progress.lastCheckedIn = new Date();
    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark a question (MCQ) as complete
exports.markQuestionComplete = async (req, res) => {
  try {
    const { courseId, questionId } = req.params;
    const userId = req.user.id;

    let progress = await Progress.findOne({ user: userId, course: courseId });
    
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedTopics: [],
        completedLibraryTopics: [],
        completedQuestions: [questionId],
        completedSections: [],
        lastCheckedIn: new Date()
      });
    } else {
      if (!progress.completedQuestions.includes(questionId)) {
        progress.completedQuestions.push(questionId);
      }
    }

    // Check if section is complete
    await checkSectionCompletion(progress, courseId);

    progress.lastCheckedIn = new Date();
    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to check if a section is complete
async function checkSectionCompletion(progress, courseId) {
  const course = await Course.findById(courseId)
    .populate({
      path: 'sections',
      populate: [
        { path: 'topics' },
        { path: 'libraryTopics' },
        { path: 'questions' }
      ]
    });

  if (!course) return;

  for (const section of course.sections) {
    // Collect all content IDs in this section
    const allTopicIds = (section.topics || []).map(t => t._id.toString());
    const allLibraryTopicIds = (section.libraryTopics || []).map(t => t._id.toString());
    const allQuestionIds = (section.questions || []).map(q => q._id.toString());

    // Check if all content is completed
    const allTopicsComplete = allTopicIds.every(id => 
      progress.completedTopics.some(cid => cid.toString() === id)
    );
    const allLibraryTopicsComplete = allLibraryTopicIds.every(id => 
      progress.completedLibraryTopics.some(cid => cid.toString() === id)
    );
    const allQuestionsComplete = allQuestionIds.every(id => 
      progress.completedQuestions.some(cid => cid.toString() === id)
    );

    const sectionComplete = allTopicsComplete && allLibraryTopicsComplete && allQuestionsComplete;

    // Update completed sections
    const sectionIdStr = section._id.toString();
    const alreadyCompleted = progress.completedSections.some(sid => sid.toString() === sectionIdStr);

    if (sectionComplete && !alreadyCompleted) {
      progress.completedSections.push(section._id);
      await progress.save();
    } else if (!sectionComplete && alreadyCompleted) {
      // Remove from completed if user uncompleted something
      progress.completedSections = progress.completedSections.filter(
        sid => sid.toString() !== sectionIdStr
      );
      await progress.save();
    }
  }
}
