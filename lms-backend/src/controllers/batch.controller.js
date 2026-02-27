const Batch = require('../models/Batch');
const User = require('../models/User');
const Institute = require('../models/Institute');
const bcrypt = require('bcrypt');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

const DEFAULT_PASSWORD = '123456';

exports.list = async (req, res) => {
  const items = await Batch.find()
    .populate('courses')
    .populate('students')
    .populate('instituteId')
    .sort({ createdAt: -1 });
  res.json(items);
};

exports.getById = async (req, res) => {
  const item = await Batch.findById(req.params.id)
    .populate('courses')
    .populate('students')
    .populate('instituteId');
  if (!item) return res.status(404).json({ msg: 'Not found' });
  res.json(item);
};

exports.createBatch = async (req, res) => {
  const { name, instituteId, certificateAllowed } = req.body;
  const batch = await Batch.create({
    name,
    instituteId,
    certificateAllowed: certificateAllowed || false
  });
  res.json(batch);
};

exports.updateBatch = async (req, res) => {
  const { name, instituteId, certificateAllowed } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (instituteId !== undefined) updateData.instituteId = instituteId;
  if (certificateAllowed !== undefined) updateData.certificateAllowed = certificateAllowed;
  
  const batch = await Batch.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  if (!batch) return res.status(404).json({ msg: 'Not found' });
  res.json(batch);
};

exports.assignCourseToBatch = async (req, res) => {
  await Batch.findByIdAndUpdate(req.params.id, { $addToSet: { courses: req.body.courseId } });
  res.json({ msg: 'Course assigned to batch' });
};

exports.assignStudentToBatch = async (req, res) => {
  const batchId = req.params.id;
  const { userId, session, instituteId } = req.body;
  if (!userId) return res.status(400).json({ msg: 'userId required' });

  await Batch.findByIdAndUpdate(batchId, { $addToSet: { students: userId } });
  await User.findByIdAndUpdate(userId, {
    ...(session ? { batchSession: session } : {}),
    ...(instituteId ? { instituteId } : {})
  });

  res.json({ msg: 'Student assigned to batch' });
};

exports.removeStudentFromBatch = async (req, res) => {
  const batchId = req.params.id;
  const userId = req.params.userId;
  await Batch.findByIdAndUpdate(batchId, { $pull: { students: userId } });
  res.json({ msg: 'Student removed from batch' });
};

exports.uploadStudentsCsv = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'CSV file required' });
  const batchId = req.params.id;
  const batch = await Batch.findById(batchId);
  if (!batch) return res.status(404).json({ msg: 'Batch not found' });

  const rows = [];
  await new Promise((resolve, reject) => {
    Readable.from(req.file.buffer)
      .pipe(csvParser())
      .on('data', (data) => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  let instituteId = batch.instituteId || null;
  if (!instituteId && rows[0]?.institute) {
    const instName = rows[0].institute.trim();
    let inst = await Institute.findOne({ name: instName });
    if (!inst) inst = await Institute.create({ name: instName });
    instituteId = inst._id;
  }

  const results = { created: 0, assigned: 0, skipped: 0 };

  for (const row of rows) {
    const email = row.email?.trim();
    if (!email) {
      results.skipped += 1;
      continue;
    }

    let user = await User.findOne({ email });
    if (!user) {
      const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      user = await User.create({
        name: row.name?.trim() || '',
        email,
        rollNo: row.rollNo?.trim() || '',
        batchSession: row.session?.trim() || '',
        institute: row.institute?.trim() || '',
        instituteId,
        password: hashed,
        role: 'user'
      });
      results.created += 1;
    }

    await Batch.findByIdAndUpdate(batchId, { $addToSet: { students: user._id } });
    results.assigned += 1;
  }

  res.json(results);
};

exports.remove = async (req, res) => {
  await Batch.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
};
