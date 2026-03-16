const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const InteractionSession = require('../models/InteractionSession');
const Course = require('../models/Course');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for session file uploads
const sessionUploadDir = path.join(__dirname, '../../uploads/sessions');
if (!fs.existsSync(sessionUploadDir)) {
  fs.mkdirSync(sessionUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, sessionUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Get all sessions (admin)
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await InteractionSession.find()
      .populate('mentor', 'name email')
      .populate('courses', 'title')
      .populate('joinedUsers', 'name email')
      .sort({ startTime: -1 });
    res.json(sessions);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: Create mentor availability/session for interaction
router.post('/sessions', auth, async (req, res) => {
  try {
    const { mentor, courses, startTime, durationMinutes } = req.body;
    if (!mentor || !courses || !startTime || !durationMinutes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60000);
    const session = await InteractionSession.create({
      mentor,
      courses,
      createdBy: req.user.id,
      startTime,
      endTime,
      durationMinutes,
      status: 'scheduled',
    });
    
    // Populate mentor details in response
    await session.populate('mentor', 'name email');
    await session.populate('courses', 'title');
    res.json(session);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get all sessions for mentor
router.get('/mentor/sessions', auth, async (req, res) => {
  try {
    const sessions = await InteractionSession.find({ mentor: req.user.id })
      .populate('courses', 'title')
      .populate('joinedUsers', 'name email')
      .sort({ startTime: -1 });
    res.json(sessions);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get sessions for user (based on their enrolled courses)
router.get('/user/sessions', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const Batch = require('../models/Batch');
    
    // Get user's assigned courses (direct enrollment)
    const user = await User.findById(req.user.id).select('assignedCourses').populate('assignedCourses', '_id');
    const directCourseIds = user?.assignedCourses?.map(c => c._id) || [];
    console.log(`User ${req.user.id} has ${directCourseIds.length} directly assigned courses`);
    
    // Also get courses from batches where user is enrolled
    const batches = await Batch.find({ students: req.user.id }).populate('courses', '_id');
    const batchCourseIds = [];
    batches.forEach(batch => {
      batch.courses.forEach(course => {
        const courseId = course._id.toString();
        if (!batchCourseIds.find(id => id.toString() === courseId)) {
          batchCourseIds.push(course._id);
        }
      });
    });
    console.log(`User ${req.user.id} is in ${batches.length} batches with ${batchCourseIds.length} courses`);
    
    // Combine all course IDs
    const allCourseIds = [...directCourseIds, ...batchCourseIds];
    const uniqueCourseIds = [...new Set(allCourseIds.map(id => id.toString()))].map(id => id);
    
    if (uniqueCourseIds.length === 0) {
      console.log(`User ${req.user.id} has no enrolled courses (direct or batch)`);
      return res.json([]);
    }
    
    const sessions = await InteractionSession.find({ 
      courses: { $in: uniqueCourseIds },
      status: { $in: ['scheduled', 'active'] }
    })
      .populate('mentor', 'name email')
      .populate('courses', 'title')
      .sort({ startTime: -1 });
    
    console.log(`Found ${sessions.length} sessions for user ${req.user.id}`);
    res.json(sessions);
  } catch (e) {
    console.error('Error in /user/sessions:', e);
    res.status(400).json({ error: e.message });
  }
});

// DEBUG: Get user's enrollment info and matching sessions
router.get('/debug/user-sessions', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const Batch = require('../models/Batch');
    
    // Get direct assignments
    const user = await User.findById(req.user.id).populate('assignedCourses', '_id title');
    const directCourseIds = user.assignedCourses.map(c => c._id.toString());
    
    // Get batch enrollments
    const batches = await Batch.find({ students: req.user.id }).populate('courses', '_id title');
    const batchCourseIds = [];
    const batchCourseMap = [];
    
    batches.forEach(batch => {
      batch.courses.forEach(course => {
        const courseId = course._id.toString();
        if (!batchCourseIds.includes(courseId)) {
          batchCourseIds.push(courseId);
          batchCourseMap.push({ batchName: batch.name, courseId, courseTitle: course.title });
        }
      });
    });
    
    const allUserCourseIds = [...new Set([...directCourseIds, ...batchCourseIds])];
    console.log('DEBUG: Direct courses:', directCourseIds);
    console.log('DEBUG: Batch courses:', batchCourseIds);
    console.log('DEBUG: All user course IDs:', allUserCourseIds);
    
    // Get all active/scheduled sessions
    const allSessions = await InteractionSession.find({ 
      status: { $in: ['scheduled', 'active'] }
    })
      .populate('mentor', 'name email')
      .populate('courses', '_id title');
    
    console.log('DEBUG: Total sessions found:', allSessions.length);
    
    // Check which sessions match user's courses
    const matchingSessions = allSessions.filter(session => {
      const matches = session.courses.some(course => allUserCourseIds.includes(course._id.toString()));
      return matches;
    });
    
    res.json({
      userId: req.user.id,
      userName: user.name,
      enrollment: {
        directAssignedCourses: user.assignedCourses.map(c => ({ id: c._id.toString(), title: c.title })),
        batchEnrollments: batches.map(b => ({
          batchName: b.name,
          courses: b.courses.map(c => ({ id: c._id.toString(), title: c.title }))
        })),
        allUniqueCourses: allUserCourseIds.length
      },
      sessionsInfo: {
        totalActiveSessions: allSessions.length,
        matchingSessionCount: matchingSessions.length,
        matchingSessions: matchingSessions.map(s => ({
          _id: s._id,
          mentor: s.mentor.name,
          courses: s.courses.map(c => ({ id: c._id.toString(), title: c.title })),
          status: s.status,
          startTime: s.startTime
        }))
      }
    });
  } catch (e) {
    console.error('Error in /debug/user-sessions:', e);
    res.status(400).json({ error: e.message });
  }
});

// Get single session details
router.get('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await InteractionSession.findById(req.params.id)
      .populate('mentor', 'name email')
      .populate('courses', 'title')
      .populate('joinedUsers', 'name email')
      .populate('chatLog.sender', 'name')
      .populate('chatLog.recipient', 'name');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Mentor: Start session
router.post('/sessions/:id/start', auth, async (req, res) => {
  try {
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Check if user is mentor or admin
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const isMentor = session.mentor.toString() === req.user.id;
    const isAdmin = user?.role === 'admin';
    
    if (!isMentor && !isAdmin) {
      return res.status(403).json({ error: 'Only session mentor or admin can start session' });
    }
    
    // Update session with actual start time
    const updatedSession = await InteractionSession.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active',
        actualStartTime: new Date()
      },
      { new: true }
    ).populate('joinedUsers', 'name email').populate('mentor', 'name email');
    res.json(updatedSession);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Mentor: End session
router.post('/sessions/:id/end', auth, async (req, res) => {
  try {
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Check if user is mentor or admin
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const isMentor = session.mentor.toString() === req.user.id;
    const isAdmin = user?.role === 'admin';
    
    if (!isMentor && !isAdmin) {
      return res.status(403).json({ error: 'Only session mentor or admin can end session' });
    }
    
    session.status = 'completed';
    session.actualEndTime = new Date();
    
    // Calculate actual duration in minutes
    if (session.actualStartTime) {
      const durationMs = session.actualEndTime - session.actualStartTime;
      session.durationMinutes = Math.round(durationMs / 60000);
    }
    
    // Update duration for all users in activity log
    session.userActivityLog = session.userActivityLog.map(log => {
      if (log.action === 'joined' && !log.duration) {
        const logEndTime = log.leftTime || session.actualEndTime;
        const durationMs = logEndTime - log.timestamp;
        log.duration = Math.round(durationMs / 60000);
      }
      return log;
    });
    
    // Save session recording to JSON file
    const recordingDir = path.join(__dirname, '../../uploads/recordings');
    if (!fs.existsSync(recordingDir)) fs.mkdirSync(recordingDir, { recursive: true });
    
    const fileName = `session_${session._id}_${Date.now()}.json`;
    const filePath = path.join(recordingDir, fileName);
    const sessionData = {
      sessionId: session._id,
      mentor: session.mentor,
      courses: session.courses,
      startTime: session.startTime,
      actualStartTime: session.actualStartTime,
      actualEndTime: session.actualEndTime,
      durationMinutes: session.durationMinutes,
      chatLog: session.chatLog,
      whiteboardLog: session.whiteboardLog,
      userActivityLog: session.userActivityLog
    };
    
    fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2));
    session.recordingFile = fileName;
    await session.save();
    
    res.json(session);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: Update session
router.put('/sessions/:id', auth, async (req, res) => {
  try {
    const { mentor, courses, startTime, durationMinutes } = req.body;
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Only allow updating scheduled sessions
    if (session.status !== 'scheduled') {
      return res.status(400).json({ error: 'Can only update scheduled sessions' });
    }
    
    if (mentor) session.mentor = mentor;
    if (courses) session.courses = courses;
    if (startTime) {
      session.startTime = new Date(startTime);
      if (durationMinutes) {
        session.endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60000);
      }
    }
    if (durationMinutes) session.durationMinutes = durationMinutes;
    
    await session.save();
    await session.populate('mentor', 'name email');
    await session.populate('courses', 'title');
    res.json(session);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: Cancel session
router.post('/sessions/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Only allow cancelling scheduled or active sessions
    if (!['scheduled', 'active'].includes(session.status)) {
      return res.status(400).json({ error: 'Can only cancel scheduled or active sessions' });
    }
    
    session.status = 'cancelled';
    session.cancellationReason = reason || 'No reason provided';
    await session.save();
    res.json({ ok: true, message: 'Session cancelled successfully' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// User: Request to join session (add to allowedUsers)
router.post('/sessions/:id/request-join', auth, async (req, res) => {
  try {
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    if (!session.allowedUsers.includes(req.user.id)) {
      session.allowedUsers.push(req.user.id);
      await session.save();
    }
    res.json({ ok: true, message: 'Request sent to mentor' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Mentor: Approve user to join (add to joinedUsers)
router.post('/sessions/:id/approve-user', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    if (!session.joinedUsers.includes(userId)) {
      session.joinedUsers.push(userId);
      await session.save();
    }
    
    // Return populated session data so mentor sees updated joinedUsers immediately
    const updatedSession = await InteractionSession.findById(req.params.id)
      .populate('mentor', 'name email')
      .populate('joinedUsers', 'name email')
      .populate('allowedUsers', 'name email')
      .populate('courses', 'title');
    
    res.json(updatedSession);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// User: Join session (already approved)
router.post('/sessions/:id/join', auth, async (req, res) => {
  try {
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!session.joinedUsers.includes(req.user.id)) {
      session.joinedUsers.push(req.user.id);
    }
    
    // Log user activity
    const existingActivity = session.userActivityLog.find(
      log => log.userId.toString() === req.user.id && log.action === 'joined'
    );
    
    if (!existingActivity) {
      session.userActivityLog.push({
        userId: req.user.id,
        userName: user?.name || 'Unknown',
        action: 'joined',
        timestamp: new Date(),
        duration: 0
      });
    }
    
    // Add to active users
    const userIndex = session.activeUsers.findIndex(
      u => u.userId.toString() === req.user.id
    );
    
    if (userIndex === -1) {
      session.activeUsers.push({
        userId: req.user.id,
        userName: user?.name || 'Unknown',
        lastActivityTime: new Date()
      });
    } else {
      // Update lastActivityTime if user was already active
      session.activeUsers[userIndex].lastActivityTime = new Date();
    }
    
    await session.save();
    
    // Return populated session data so mentor can see updated joinedUsers immediately
    const updatedSession = await InteractionSession.findById(req.params.id)
      .populate('mentor', 'name email')
      .populate('joinedUsers', 'name email')
      .populate('courses', 'title')
      .populate('allowedUsers', 'name email');
    
    res.json(updatedSession);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// User: Leave session
router.post('/sessions/:id/leave', auth, async (req, res) => {
  try {
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    // Check if the leaving user is the mentor
    const isMentor = session.mentor.toString() === req.user.id;
    
    // Remove from activeUsers and log the leave time
    const userIndex = session.activeUsers.findIndex(
      u => u.userId.toString() === req.user.id
    );
    
    if (userIndex !== -1) {
      session.activeUsers.splice(userIndex, 1);
    }
    
    // Update or create a leave record in userActivityLog
    // Find the latest joined record for this user
    for (let i = session.userActivityLog.length - 1; i >= 0; i--) {
      const log = session.userActivityLog[i];
      if (log.userId.toString() === req.user.id && log.action === 'joined' && !log.lefTime) {
        // Calculate duration for this session
        const durationMs = new Date() - log.timestamp;
        log.duration = Math.round(durationMs / 60000);
        log.leftTime = new Date();
        break;
      }
    }
    
    // Add leave action to log
    session.userActivityLog.push({
      userId: req.user.id,
      userName: user?.name || 'Unknown',
      action: 'left',
      timestamp: new Date(),
      duration: 0
    });
    
    // If mentor is leaving, check if admin is still in session
    if (isMentor && session.status === 'active') {
      // Check if any admin is in activeUsers
      const adminInSession = session.activeUsers.some(activeUser => {
        // We'll check this after populating - for now check if any other users remain
        return activeUser.userId.toString() !== req.user.id;
      });
      
      // If no one else is in session or session becomes empty of admins, end it
      // Load all active users to check if any admin is present
      const activeUserIds = session.activeUsers.map(u => u.userId);
      if (activeUserIds.length > 0) {
        const activeUsers = await User.find({ _id: { $in: activeUserIds }, role: 'admin' });
        if (activeUsers.length === 0) {
          // No admin in session, end it for all users
          session.status = 'completed';
          session.actualEndTime = new Date();
          
          // Calculate actual duration
          if (session.actualStartTime) {
            const durationMs = session.actualEndTime - session.actualStartTime;
            session.durationMinutes = Math.round(durationMs / 60000);
          }
        }
      } else {
        // No one left in session, end it
        session.status = 'completed';
        session.actualEndTime = new Date();
        
        // Calculate actual duration
        if (session.actualStartTime) {
          const durationMs = session.actualEndTime - session.actualStartTime;
          session.durationMinutes = Math.round(durationMs / 60000);
        }
      }
    }
    
    await session.save();
    res.json({ ok: true, message: 'Left session successfully' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get session report
router.get('/sessions/:id/report', auth, async (req, res) => {
  try {
    const session = await InteractionSession.findById(req.params.id)
      .populate('mentor', 'name email')
      .populate('joinedUsers', 'name email')
      .populate('courses', 'title');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Calculate attendance summary
    const userAttendance = {};
    session.userActivityLog.forEach(log => {
      if (!userAttendance[log.userId]) {
        userAttendance[log.userId] = {
          userId: log.userId,
          userName: log.userName,
          joinCount: 0,
          totalDuration: 0,
          firstJoinTime: null,
          lastLeaveTime: null
        };
      }
      
      if (log.action === 'joined') {
        userAttendance[log.userId].joinCount++;
        if (!userAttendance[log.userId].firstJoinTime) {
          userAttendance[log.userId].firstJoinTime = log.timestamp;
        }
      } else if (log.action === 'left') {
        userAttendance[log.userId].lastLeaveTime = log.timestamp;
      }
      
      if (log.duration) {
        userAttendance[log.userId].totalDuration += log.duration;
      }
    });
    
    // Build report object
    const report = {
      sessionId: session._id,
      mentor: session.mentor,
      courses: session.courses,
      scheduledStartTime: session.startTime,
      scheduledEndTime: session.endTime,
      actualStartTime: session.actualStartTime,
      actualEndTime: session.actualEndTime,
      status: session.status,
      scheduledDurationMinutes: session.durationMinutes,
      actualDurationMinutes: session.durationMinutes,
      totalUsersJoined: session.joinedUsers.length,
      totalMessages: session.chatLog.length,
      totalFilesShared: session.sharedFiles.length,
      userAttendance: Object.values(userAttendance),
      currentActiveUsers: session.activeUsers.map(u => ({
        userId: u.userId,
        userName: u.userName,
        lastActivityTime: u.lastActivityTime
      })),
      chatLog: session.chatLog,
      whiteboardLog: session.whiteboardLog,
      sharedFiles: session.sharedFiles
    };
    
    res.json(report);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Chat: Add message to session
router.post('/sessions/:id/chat', auth, async (req, res) => {
  try {
    const { type, content, audioUrl, isGroupChat, recipient } = req.body;
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const User = require('../models/User');
    const Mentor = require('../models/Mentor');
    
    // Try to find sender in User collection first, then Mentor collection
    let sender = await User.findById(req.user.id);
    let senderRole = 'user';
    if (!sender) {
      sender = await Mentor.findById(req.user.id);
      senderRole = 'mentor';
    } else if (sender.role === 'admin') {
      senderRole = 'admin';
    }
    
    // Update last activity time for this user
    const userIndex = session.activeUsers.findIndex(
      u => u.userId.toString() === req.user.id
    );
    
    if (userIndex !== -1) {
      session.activeUsers[userIndex].lastActivityTime = new Date();
    } else {
      // If user not in active users (shouldn't happen), add them
      session.activeUsers.push({
        userId: req.user.id,
        userName: sender?.name || 'Unknown',
        lastActivityTime: new Date()
      });
    }
    
    // Add message to chat log
    session.chatLog.push({
      sender: req.user.id,
      senderName: sender?.name || 'Unknown',
      senderRole: senderRole,
      type: type || 'text',
      content,
      audioUrl: audioUrl || null,
      isGroupChat: isGroupChat !== false,
      recipient: isGroupChat === false ? recipient : null,
      timestamp: new Date()
    });
    
    await session.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Mentor: Mute/unmute user
router.post('/sessions/:id/mute', auth, async (req, res) => {
  try {
    const { userId, mute } = req.body;
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    if (mute) {
      if (!session.mutedUsers.includes(userId)) {
        session.mutedUsers.push(userId);
      }
    } else {
      session.mutedUsers = session.mutedUsers.filter(u => u.toString() !== userId);
    }
    
    await session.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Mentor: Set audio permission for user
router.post('/sessions/:id/audio-permission', auth, async (req, res) => {
  try {
    const { userId, allow } = req.body;
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    session.audioPermissions.set(userId, !!allow);
    await session.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Whiteboard: Save whiteboard drawing
router.post('/sessions/:id/whiteboard', auth, async (req, res) => {
  try {
    const { action, data, imageData } = req.body;
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Save whiteboard log action
    session.whiteboardLog.push({
      action,
      data,
      timestamp: new Date()
    });
    
    // Save canvas image snapshot if provided
    if (imageData) {
      session.whiteboardImage = imageData;
    }
    
    // Handle clear action
    if (action === 'clear') {
      session.whiteboardImage = null;
      session.whiteboardLog = [];
    }
    
    await session.save();
    res.json({ ok: true, whiteboardImage: session.whiteboardImage });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Screen Share: Toggle screen sharing status
// Get session recording
router.get('/recordings/:filename', auth, async (req, res) => {
  try {
    const recordingDir = path.join(__dirname, '../../uploads/recordings');
    const filePath = path.join(recordingDir, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: Delete session
router.delete('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await InteractionSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Upload file to session
router.post('/sessions/:id/upload-file', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Check if current user is mentor
    const isMentor = session.mentor.toString() === req.user.id;

    const fileInfo = {
      uploadedBy: req.user.id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      filePath: `/uploads/sessions/${req.file.filename}`,
      uploadedAt: new Date(),
      mimeType: req.file.mimetype
    };

    if (isMentor) {
      // Mentor files go directly to sharedFiles
      if (!session.sharedFiles) {
        session.sharedFiles = [];
      }
      session.sharedFiles.push(fileInfo);
    } else {
      // User files go to pendingFiles (need mentor approval)
      if (!session.pendingFiles) {
        session.pendingFiles = [];
      }
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      fileInfo.uploaderName = user?.name || 'Unknown User';
      session.pendingFiles.push(fileInfo);
    }

    await session.save();

    res.json({ 
      ok: true, 
      file: fileInfo,
      message: isMentor ? 'File shared' : 'File uploaded. Waiting for mentor approval.'
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Mentor: Approve pending file upload
router.post('/sessions/:id/approve-file', auth, async (req, res) => {
  try {
    const { fileIndex } = req.body;
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Check if current user is mentor
    if (session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only mentor can approve files' });
    }

    if (!session.pendingFiles || !session.pendingFiles[fileIndex]) {
      return res.status(404).json({ error: 'Pending file not found' });
    }

    const pendingFile = session.pendingFiles[fileIndex];
    
    // Move from pending to shared
    if (!session.sharedFiles) {
      session.sharedFiles = [];
    }
    session.sharedFiles.push({
      uploadedBy: pendingFile.uploadedBy,
      fileName: pendingFile.fileName,
      fileSize: pendingFile.fileSize,
      filePath: pendingFile.filePath,
      uploadedAt: pendingFile.uploadedAt,
      mimeType: pendingFile.mimeType
    });

    // Remove from pending
    session.pendingFiles.splice(fileIndex, 1);
    await session.save();

    res.json({ ok: true, message: 'File approved' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Mentor: Reject pending file upload
router.post('/sessions/:id/reject-file', auth, async (req, res) => {
  try {
    const { fileIndex } = req.body;
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Check if current user is mentor
    if (session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only mentor can reject files' });
    }

    if (!session.pendingFiles || !session.pendingFiles[fileIndex]) {
      return res.status(404).json({ error: 'Pending file not found' });
    }

    const pendingFile = session.pendingFiles[fileIndex];
    
    // Delete the physical file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../uploads/sessions', path.basename(pendingFile.filePath));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from pending
    session.pendingFiles.splice(fileIndex, 1);
    await session.save();

    res.json({ ok: true, message: 'File rejected' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Download file from session
router.get('/sessions/:id/files/:filename', auth, async (req, res) => {
  try {
    const session = await InteractionSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const file = session.sharedFiles?.find(f => 
      f.filePath.includes(req.params.filename)
    );
    if (!file) return res.status(404).json({ error: 'File not found' });

    const filePath = path.join(__dirname, '../..', file.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, file.fileName);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
