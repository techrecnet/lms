require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
process.on('uncaughtException', (err) => console.error('uncaughtException:', err));
process.on('unhandledRejection', (err) => console.error('unhandledRejection:', err));
console.log('Starting app. PORT=', process.env.PORT);

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/institutes', require('./routes/institute.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/sections', require('./routes/section.routes'));
// app.use('/api/chapters', require('./routes/chapter.routes')); // Removed - chapters now part of sections
app.use('/api/topics', require('./routes/topic.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/batch', require('./routes/batch.routes'));
app.use('/api/questions', require('./routes/questionbank.routes'));
app.use('/api/topics-lib', require('./routes/topiclibrary.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/mentor', require('./routes/mentor.routes'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//const PORT = process.env.PORT || 3000;
//app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
//module.exports = app;

