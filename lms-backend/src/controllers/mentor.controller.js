const MentorAssignment = require('../models/MentorAssignment');
const Mentor = require('../models/Mentor');
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const Progress = require('../models/Progress');

exports.listMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find({}).select('-password');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).select('-password');
    if (!mentor) return res.status(404).json({ msg: 'Mentor not found' });
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.createMentor = async (req, res) => {
  try {
    const { name, email, password, doj, gender, phone, isActive } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existing = await Mentor.findOne({ email });
    if (existing) {
      return res.status(409).json({ msg: 'Email already in use' });
    }

    const mentor = await Mentor.create({
      name,
      email,
      password,
      doj: doj || new Date(),
      gender,
      phone,
      isActive: isActive !== undefined ? isActive : true,
    });

    const response = mentor.toJSON();
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateMentor = async (req, res) => {
  try {
    const { name, email, password, doj, gender, phone, isActive } = req.body;

    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ msg: 'Mentor not found' });

    // Check email uniqueness if changed
    if (email && email !== mentor.email) {
      const existing = await Mentor.findOne({ email });
      if (existing) {
        return res.status(409).json({ msg: 'Email already in use' });
      }
    }

    if (name) mentor.name = name;
    if (email) mentor.email = email;
    if (password) mentor.password = password; // Will be hashed by pre-save hook
    if (doj) mentor.doj = doj;
    if (gender) mentor.gender = gender;
    if (phone) mentor.phone = phone;
    if (isActive !== undefined) mentor.isActive = isActive;

    await mentor.save();
    const response = mentor.toJSON();
    res.json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndDelete(req.params.id);
    if (!mentor) return res.status(404).json({ msg: 'Mentor not found' });

    // Also delete mentor assignments
    await MentorAssignment.updateMany(
      { mentors: req.params.id },
      { $pull: { mentors: req.params.id } }
    );

    res.json({ msg: 'Mentor deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.listAssignmentsAdmin = async (req, res) => {
  try {
    const { batchId } = req.query;
    const filter = {};
    if (batchId) filter.batch = batchId;

    const items = await MentorAssignment.find(filter)
      .populate('mentors', 'name email')
      .populate('batch')
      .populate('course');
    res.json(items);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.listMyAssignments = async (req, res) => {
  try {
    const items = await MentorAssignment.find({ mentors: req.user.id })
      .populate('batch')
      .populate('course');
    res.json(items);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.upsertAssignment = async (req, res) => {
  try {
    const { mentorIds, batchId, courseId } = req.body;
    
    if (!Array.isArray(mentorIds) || mentorIds.length === 0 || !batchId || !courseId) {
      return res.status(400).json({ msg: 'mentorIds (array), batchId and courseId are required' });
    }

    // Validate all mentors exist
    const mentors = await Mentor.find({ _id: { $in: mentorIds } });
    if (mentors.length !== mentorIds.length) {
      return res.status(400).json({ msg: 'One or more mentors not found' });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ msg: 'Batch not found' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const hasCourse = (batch.courses || []).some((c) => String(c) === String(courseId));
    if (!hasCourse) {
      return res.status(400).json({ msg: 'Course is not assigned to the batch' });
    }

    let assignment = await MentorAssignment.findOne({ batch: batchId, course: courseId });
    if (assignment) {
      assignment.mentors = mentorIds;
      await assignment.save();
    } else {
      assignment = await MentorAssignment.create({
        batch: batchId,
        course: courseId,
        mentors: mentorIds
      });
    }
    
    // Refetch with all populated fields
    const populated = await MentorAssignment.findById(assignment._id)
      .populate('mentors', 'name email')
      .populate('batch')
      .populate('course');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getMentorReport = async (req, res) => {
  try {
    const { batchId, courseId } = req.params;
    const mentorId = req.user.id;

    const assignment = await MentorAssignment.findOne(
      { batch: batchId, course: courseId, mentors: mentorId }
    );
    if (!assignment) {
      return res.status(403).json({ msg: 'Not assigned to this course' });
    }

    const batch = await Batch.findById(batchId).populate('students');
    if (!batch) return res.status(404).json({ msg: 'Batch not found' });

    const course = await Course.findById(courseId).populate('sections');
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const totalSections = course.sections?.length || 0;

    const students = batch.students || [];
    const progressDocs = await Progress.find({
      user: { $in: students.map(s => s._id) },
      course: courseId
    });

    const progressMap = new Map(progressDocs.map(p => [String(p.user), p]));

    const distribution = { 0: 0, 10: 0, 25: 0, 50: 0, 75: 0, 100: 0 };

    const studentRows = students.map((s) => {
      const progress = progressMap.get(String(s._id));
      const completedSections = progress?.completedSections?.length || 0;
      const percent = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

      let bucket = 0;
      if (percent === 0) bucket = 0;
      else if (percent <= 10) bucket = 10;
      else if (percent <= 25) bucket = 25;
      else if (percent <= 50) bucket = 50;
      else if (percent <= 75) bucket = 75;
      else bucket = 100;

      distribution[bucket] += 1;

      return {
        userId: s._id,
        name: s.name || s.email,
        email: s.email,
        completedSections,
        pendingSections: Math.max(totalSections - completedSections, 0),
        percentComplete: Math.min(percent, 100),
        lastCheckedIn: progress?.lastCheckedIn || progress?.updatedAt || null
      };
    });

    res.json({
      batch: { id: batch._id, name: batch.name },
      course: { id: course._id, title: course.title },
      totalSections,
      distribution,
      students: studentRows
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

