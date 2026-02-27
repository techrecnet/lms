const User = require('../models/User');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const Institute = require('../models/Institute');
const Progress = require('../models/Progress');
const bcrypt = require('bcrypt');
const csvParser = require('csv-parser');
const { Readable } = require('stream');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const DEFAULT_PASSWORD = '123456';

exports.createUser = async (req, res) => {
  const { password, email } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ msg: 'Email already in use' });

  const hashed = await bcrypt.hash(password || DEFAULT_PASSWORD, 10);
  const user = await User.create({
    ...req.body,
    password: hashed,
    role: req.body.role ?? 'user',
    isActive: req.body.isActive ?? true
  });
  res.json(user);
};

exports.getUsers = async (req, res) => {
  const { email, instituteId, role } = req.query;
  const filter = role ? { role } : { role: { $ne: 'admin' } };
  if (email) filter.email = { $regex: email, $options: 'i' };
  if (instituteId) filter.instituteId = instituteId;

  const users = await User.find(filter)
    .populate('instituteId')
    .sort({ createdAt: -1 });
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).populate('instituteId');
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const updates = { ...req.body };
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  } else {
    delete updates.password;
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(user);
};

exports.removeUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (user) {
    await Batch.updateMany({ students: user._id }, { $pull: { students: user._id } });
  }
  res.json({ msg: 'Deleted' });
};

exports.uploadUsersCsv = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'CSV file required' });

  const rows = [];
  await new Promise((resolve, reject) => {
    Readable.from(req.file.buffer)
      .pipe(csvParser())
      .on('data', (data) => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  const results = { created: 0, skipped: 0 };

  for (const row of rows) {
    const email = row.email?.trim();
    if (!email) {
      results.skipped += 1;
      continue;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      results.skipped += 1;
      continue;
    }

    let instituteId = null;
    if (row.institute?.trim()) {
      const instituteName = row.institute.trim();
      let institute = await Institute.findOne({ name: instituteName });
      if (!institute) institute = await Institute.create({ name: instituteName });
      instituteId = institute._id;
    }

    let batchId = null;
    if (row.batch?.trim()) {
      const batchName = row.batch.trim();
      const batchFilter = instituteId ? { name: batchName, instituteId } : { name: batchName };
      let batch = await Batch.findOne(batchFilter);
      if (!batch) batch = await Batch.create({ name: batchName, instituteId });
      batchId = batch._id;
    }

    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const user = await User.create({
      name: row.name?.trim() || '',
      email,
      rollNo: row.rollNo?.trim() || '',
      batchSession: row.session?.trim() || '',
      institute: row.institute?.trim() || '',
      instituteId,
      password: hashed,
      role: 'user',
      isActive: true
    });

    if (batchId) {
      await Batch.findByIdAndUpdate(batchId, { $addToSet: { students: user._id } });
    }

    results.created += 1;
  }

  res.json(results);
};

// GET /users/me/courses
exports.getMyCourses = async (req, res) => {
  const user = await User.findById(req.user.id).populate('assignedCourses');
  if (!user) return res.status(404).json({ msg: 'User not found' });

  const direct = user.assignedCourses || [];
  const batches = await Batch.find({ students: user._id }).populate('courses');

  const courseMap = new Map();

  direct.forEach((course) => {
    courseMap.set(String(course._id), {
      ...course.toObject(),
      certificateAllowed: false
    });
  });

  batches.forEach((batch) => {
    (batch.courses || []).forEach((course) => {
      const id = String(course._id);
      const existing = courseMap.get(id);
      courseMap.set(id, {
        ...course.toObject(),
        certificateAllowed: (existing?.certificateAllowed || false) || (batch.certificateAllowed || false)
      });
    });
  });

  res.json(Array.from(courseMap.values()));
};

// POST /users/me/enroll
exports.enrollInCourse = async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ msg: 'courseId required' });
  if (req.user.role !== 'user') return res.status(403).json({ msg: 'Only students can enroll' });

  const [user, course] = await Promise.all([
    User.findById(req.user.id),
    Course.findById(courseId)
  ]);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  if (!course) return res.status(404).json({ msg: 'Course not found' });

  const alreadyDirect = (user.assignedCourses || []).some((id) => String(id) === String(courseId));
  const existingBatch = await Batch.findOne({ students: user._id, courses: courseId });
  if (alreadyDirect || existingBatch) {
    return res.json({ enrolled: true, batchId: existingBatch?._id || null, courseId });
  }

  let instituteId = user.instituteId || null;
  if (!instituteId) {
    const recentInstitute = await Institute.findOne().sort({ createdAt: -1 });
    instituteId = recentInstitute?._id || null;
  }

  const batchFilter = instituteId ? { name: 'AutoBatch', instituteId } : { name: 'AutoBatch' };
  let batch = await Batch.findOne(batchFilter);
  if (!batch) {
    batch = await Batch.create({ name: 'AutoBatch', instituteId });
  }

  await Batch.findByIdAndUpdate(batch._id, { $addToSet: { courses: courseId, students: user._id } });

  res.json({ enrolled: true, batchId: batch._id, courseId });
};

// GET /users/me - Get current user profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('instituteId');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /users/me - Update current user profile
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, rollNo, batchSession, class: userClass } = req.body;
    const updates = { name, rollNo, batchSession, class: userClass };
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /users/me/password - Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Current and new password required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });
    
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

exports.uploadProfileImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /users/me/profile-image - Upload profile image
exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No image file provided' });
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // Delete old image if exists
    if (user.studentImage) {
      const oldImagePath = path.join(__dirname, '../../uploads/profiles', path.basename(user.studentImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    user.studentImage = imageUrl;
    await user.save();
    
    res.json({ imageUrl, user: await User.findById(user._id).select('-password') });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /users/:id/progress - Get user's course progress (admin only)
exports.getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedCourses')
      .populate('instituteId');
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // Get batch courses
    const batches = await Batch.find({ students: user._id }).populate('courses');
    const batchCourses = batches.flatMap((b) => b.courses || []);
    
    // Combine direct and batch courses
    const courseMap = new Map();
    [...(user.assignedCourses || []), ...batchCourses].forEach(c => courseMap.set(String(c._id), c));
    const allCourses = Array.from(courseMap.values());
    
    // Get progress for each course
    const progressData = await Promise.all(
      allCourses.map(async (course) => {
        const progress = await Progress.findOne({ user: user._id, course: course._id });
        return {
          course: {
            _id: course._id,
            title: course.title,
            description: course.description
          },
          completedSections: progress?.completedSections?.length || 0,
          completedTopics: progress?.completedTopics?.length || 0,
          completedLibraryTopics: progress?.completedLibraryTopics?.length || 0,
          completedQuestions: progress?.completedQuestions?.length || 0,
          totalSections: course.sections?.length || 0
        };
      })
    );
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentImage: user.studentImage,
        rollNo: user.rollNo,
        batchSession: user.batchSession,
        institute: user.institute,
        instituteId: user.instituteId
      },
      progress: progressData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
