# Interaction Board Module Documentation

## Overview
The Interaction Board is a real-time communication platform within the LMS that enables mentors and students to interact through chat, audio, and a whiteboard. It provides a structured way for mentors to schedule availability and for students to join interactive sessions.

## Features

### 1. Mentor Availability Management
- **Create Sessions**: Mentors can schedule availability time slots for specific courses
- **Session Duration**: Mentors specify the date, time, and duration of their availability
- **Multiple Courses**: One session can be set up for multiple courses simultaneously
- **Session Status Tracking**: Sessions have states - scheduled, active, completed, cancelled

### 2. Student Notifications & Joining
- **Dashboard Alerts**: Students see available mentor sessions for courses they've enrolled in
- **Join Requests**: Students can request to join sessions
- **Mentor Approval**: Mentors must approve join requests before students enter
- **Session Indicators**: Clear indication of session status (scheduled, active, completed)

### 3. Interaction Board Interface
#### For Mentors:
- View all joined students
- Start/end sessions
- Approve student join requests
- Control audio permissions per student
- Mute/unmute individual students or all students
- Initiate whiteboard for teaching
- Send group or individual messages
- Monitor participant activity

#### For Students:
- View only the mentor in the session
- Send text messages in group chat
- Request and receive audio permissions from mentor
- Request personal chats with mentor
- View mentor's whiteboard
- Audio input when permitted

### 4. Chat Features
- **Group Chat**: Messages visible to all session participants
- **Private Chat**: Direct messages between mentor and individual students
- **Message Types**: Text and audio messages
- **Timestamps**: All messages are timestamped
- **Persistent Log**: All messages are saved for review

### 5. Audio Management
- **Permission-based**: Users need mentor's permission for audio
- **Mute Control**: Mentors can mute all or specific users
- **Audio Indicators**: Visual indicators for audio permissions and mute status

### 6. Whiteboard
- **Mentor-exclusive**: Only mentors can draw on whiteboard
- **Digital Pen**: Draw and write explanations
- **Clear Option**: Clear whiteboard content
- **Persistent**: Whiteboard actions are recorded

### 7. Session Recording & Review
- **Automatic Recording**: All sessions are automatically recorded
- **JSON Format**: Session data stored in JSON for easy analysis
- **Transcript Download**: Mentors can download full session transcripts
- **Review Access**: View chat history and whiteboard actions
- **Components Recorded**:
  - Chat messages (sender, type, content, timestamp)
  - Whiteboard actions and coordinates
  - Participant list
  - Timestamps of all interactions

## API Endpoints

### Admin APIs
- `POST /api/interaction/sessions` - Create interaction session
- `GET /api/interaction/sessions` - List all sessions
- `DELETE /api/interaction/sessions/:id` - Delete session

### Mentor APIs
- `GET /api/interaction/mentor/sessions` - Get mentor's sessions
- `POST /api/interaction/sessions/:id/start` - Start session
- `POST /api/interaction/sessions/:id/end` - End session and save recording
- `POST /api/interaction/sessions/:id/approve-user` - Approve user join request
- `POST /api/interaction/sessions/:id/mute` - Mute/unmute user
- `POST /api/interaction/sessions/:id/audio-permission` - Set audio permission
- `POST /api/interaction/sessions/:id/whiteboard` - Add whiteboard action

### User APIs
- `GET /api/interaction/user/sessions` - Get available sessions for user's courses
- `POST /api/interaction/sessions/:id/request-join` - Request to join session
- `POST /api/interaction/sessions/:id/join` - Join approved session
- `GET /api/interaction/sessions/:id` - Get session details

### Chat APIs
- `POST /api/interaction/sessions/:id/chat` - Send chat message

### Review APIs
- `GET /api/interaction/recordings/:filename` - Get session recording

## Database Models

### InteractionSession
```javascript
{
  mentor: ObjectId,              // Mentor reference
  courses: [ObjectId],          // Course references
  createdBy: ObjectId,          // Admin/Mentor who created it
  startTime: Date,              // Session start time
  endTime: Date,                // Session end time
  durationMinutes: Number,      // Duration in minutes
  status: String,               // 'scheduled', 'active', 'completed', 'cancelled'
  allowedUsers: [ObjectId],     // Users who requested to join
  joinedUsers: [ObjectId],      // Users actively in session
  chatLog: [{
    sender: ObjectId,
    senderName: String,
    type: String,              // 'text' or 'audio'
    content: String,
    audioUrl: String,
    isGroupChat: Boolean,
    recipient: ObjectId,       // For personal messages
    timestamp: Date
  }],
  whiteboardLog: [{
    action: String,
    data: Mixed,
    timestamp: Date
  }],
  audioPermissions: Map,        // userId: true/false
  mutedUsers: [ObjectId],       // Muted user references
  recordingFile: String,        // Path to JSON recording
  timestamps                    // createdAt, updatedAt
}
```

## Frontend Structure

### Components
- **MentorSessionsList**: Shows mentor's sessions with start/end controls
- **UserSessionsList**: Shows available sessions for user's courses
- **InteractionBoard**: Main chat and collaboration interface
- **SessionReview**: Review past sessions with transcripts
- **InteractionSessionsManagement**: Admin interface for session management

### Routes
- `/mentor` - Mentor dashboard (includes sessions)
- `/mentor/interaction/:id` - Join/manage interaction board
- `/mentor/interaction/:id/review` - Review past session
- `/app` - User dashboard (includes available sessions)
- `/user/interaction/:id` - User's interaction board view
- `/admin/interaction` - Admin session management

## Usage Workflow

### For Mentors (Creating & Running Sessions)
1. Go to Mentor Dashboard
2. In "Interaction Sessions" section, click "Create Session"
3. Fill in:
   - Select courses to make available
   - Set start date and time
   - Set duration in minutes
4. Click "Create" - Session is now scheduled
5. When class time arrives, click "Start Session"
6. Session changes to "active"
7. Approve student join requests
8. Manage audio permissions and mute as needed
9. Use whiteboard to explain concepts
10. When done, click "End Session"
11. Session recording is automatically saved
12. Review transcripts anytime by clicking "Review Session"

### For Students (Joining Sessions)
1. Go to User Dashboard
2. In "Available Mentor Sessions" section, find your mentor's session
3. If session is scheduled, click "Request to Join"
4. Wait for mentor to approve your request
5. Once approved and session becomes active, "Join Live Session" button appears
6. Click to enter the interaction board
7. See only the mentor and can chat/participate
8. Request audio permission from mentor if needed
9. View whiteboard as mentor explains

### For Admins (Managing Sessions)
1. Go to Admin Dashboard > Interaction Sessions
2. Click "Create Session" to create a new session
3. Select mentor, courses, start time, and duration
4. View all sessions in table format
5. Delete sessions if needed
6. Monitor which mentors and courses have active sessions

## File Locations

### Backend
- Model: `lms-backend/src/models/InteractionSession.js`
- Routes: `lms-backend/src/routes/interaction.routes.js`
- Recordings: `lms-backend/uploads/recordings/`

### Frontend
- Components: `lms-frontend/src/features/interaction/`
  - `MentorSessionsList.tsx`
  - `UserSessionsList.tsx`
  - `InteractionBoard.tsx`
  - `SessionReview.tsx`
- Admin: `lms-frontend/src/features/admin/interaction/InteractionSessionsManagement.tsx`
- Router: `lms-frontend/src/app/router.tsx`

## Future Enhancements

### Real-time Communication
- Integrate Socket.io for real-time chat and updates
- Implement actual audio/video streaming
- Live whiteboard drawing with canvas

### Advanced Features
- Breakout rooms for group discussions
- Screen sharing for mentors
- Recording quality options (HD, SD)
- Session scheduling with calendar integration
- Email notifications for upcoming sessions
- Attendance reports
- Evaluation forms post-session
- Session scheduling templates

### Security
- End-to-end encryption for audio
- Access control based on roles
- Rate limiting for chat messages
- GDPR-compliant recording management

## Performance Considerations

1. **Message Polling**: Currently uses 2-second polling. For production, implement WebSocket.
2. **Large Sessions**: Test with 100+ participants before deploying to production.
3. **Recording Storage**: Monitor disk space for JSON recordings.
4. **Concurrent Sessions**: Ensure database can handle multiple simultaneous sessions.

## Troubleshooting

### Sessions not appearing
- Check that user is enrolled in the course
- Verify session start time has not passed
- Confirm session status is not 'cancelled'

### Unable to approve users
- Verify you are logged in as the mentor
- Check that users have clicked "Request to Join"

### Chat messages not saving
- Check backend connection
- Verify session ID is correct

### Recording not found
- Confirm session was ended properly (not just closed)
- Check `uploads/recordings/` folder exists

## Support & Contribution
For bugs or feature requests, please create an issue in the development repository.
