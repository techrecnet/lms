const mongoose = require('mongoose');

const InteractionSessionSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin or mentor
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  actualStartTime: { type: Date, default: null }, // when session actually started
  actualEndTime: { type: Date, default: null }, // when session actually ended
  status: { type: String, enum: ['scheduled', 'active', 'completed', 'cancelled'], default: 'scheduled' },
  cancellationReason: { type: String, default: null }, // reason for cancellation
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // users who can join
  joinedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // users actively joined
  userActivityLog: [{ // track user join/leave times
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    action: { type: String, enum: ['joined', 'left'] },
    timestamp: { type: Date, default: Date.now },
    duration: Number // total time in session in minutes for this session
  }],
  activeUsers: [{ // users currently active/chatting
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    lastActivityTime: { type: Date, default: Date.now }
  }],
  chatLog: [{ 
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
    type: { type: String, enum: ['text', 'audio'], default: 'text' },
    content: String,
    audioUrl: String,
    isGroupChat: { type: Boolean, default: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for personal chat
    timestamp: { type: Date, default: Date.now }
  }],
  whiteboardLog: [{
    action: String, // 'draw', 'clear', 'write', etc.
    data: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],
  whiteboardImage: { type: String, default: null }, // Base64 encoded canvas image for whiteboard
  audioPermissions: { type: Map, of: Boolean, default: {} }, // userId: true/false
  mutedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  recordingFile: { type: String }, // path to JSON file
  sharedFiles: [{ 
    uploadedBy: mongoose.Schema.Types.ObjectId,
    fileName: String,
    fileSize: Number,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now },
    mimeType: String
  }],
  pendingFiles: [{ 
    uploadedBy: mongoose.Schema.Types.ObjectId,
    uploaderName: String,
    fileName: String,
    fileSize: Number,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now },
    mimeType: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('InteractionSession', InteractionSessionSchema);
