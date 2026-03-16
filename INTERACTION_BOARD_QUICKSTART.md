# Interaction Board - Quick Start Guide

## Installation & Setup

### Backend Setup
1. The interaction board routes are already registered in `src/server.js`
2. Ensure MongoDB is running and connected
3. No additional npm packages needed for basic functionality

### Frontend Setup
1. All frontend components are created in the interaction feature module
2. Routes are configured in `src/app/router.tsx`
3. Components integrate with existing layouts (AdminLayout, MentorLayout, UserLayout)

## Testing the Interaction Board

### Prerequisites Setup
Before testing, ensure you have:
- At least 2 user accounts (one mentor, one student)
- Both users enrolled in the same course
- Admin account for creating sessions

### Step-by-Step Testing

#### 1. Admin Creates a Session
1. Login as admin
2. Navigate to `/admin/interaction`
3. Click "Create Session"
4. Fill in:
   - Select a mentor
   - Select at least one course
   - Set start date/time (can be immediate for testing)
   - Set duration (e.g., 30 minutes)
5. Click "Create"
6. You should see the session in the table

#### 2. Mentor Views Session
1. Login as mentor
2. Navigate to Mentor Dashboard (`/mentor`)
3. You should see "Interaction Sessions" section
4. Your created session appears with status "scheduled"
5. Click "Start Session" to make it active

#### 3. Student Joins Session
1. Login as student
2. Navigate to User Dashboard (`/app`)
3. You should see "Available Mentor Sessions" section
4. If session is active, click "Join Live Session"
5. If session is still scheduled, click "Request to Join"

#### 4. Test Chat Features
1. In the interaction board:
   - Type a message in the chat input
   - Click "Send" or press Enter
   - Message appears in chat area
2. For mentor: Can select students from right sidebar to send private messages
3. For student: Can click mentor's name to send private message

#### 5. Test Audio Permissions
1. As mentor: Click mic icon on a student's name to grant audio permission
2. As student: Try to enable audio - it will be disabled until mentor grants permission
3. Once permission granted, student can enable audio

#### 6. Test Mute Features
1. As mentor: Click sound icon to mute/unmute a student
2. Muted icon changes to indicate muted status

#### 7. Test Whiteboard
1. As mentor: Click "Whiteboard" button (only visible for mentors)
2. Dialog opens with canvas area
3. In real implementation, this would support drawing

#### 8. Test Session End & Recording
1. As mentor: Click "End Session" button
2. Session status changes to "completed"
3. Recording is saved automatically
4. Both mentor and student see "Review Session" button
5. Click to view chat transcript and whiteboard actions

#### 9. Admin Reviews All Sessions
1. Login as admin
2. Go to `/admin/interaction`
3. See all sessions with mentors, courses, and status
4. Can delete sessions if needed

### API Testing with cURL

#### Create Session
```bash
curl -X POST http://localhost:5000/api/interaction/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mentor": "MENTOR_ID",
    "courses": ["COURSE_ID"],
    "startTime": "2026-03-15T10:00:00Z",
    "durationMinutes": 30
  }'
```

#### Get Mentor Sessions
```bash
curl -X GET http://localhost:5000/api/interaction/mentor/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get User Sessions
```bash
curl -X GET http://localhost:5000/api/interaction/user/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Send Chat Message
```bash
curl -X POST http://localhost:5000/api/interaction/sessions/SESSION_ID/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "Hello everyone!",
    "isGroupChat": true
  }'
```

#### Start Session
```bash
curl -X POST http://localhost:5000/api/interaction/sessions/SESSION_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### End Session
```bash
curl -X POST http://localhost:5000/api/interaction/sessions/SESSION_ID/end \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Approve User Join
```bash
curl -X POST http://localhost:5000/api/interaction/sessions/SESSION_ID/approve-user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID"}'
```

#### Set Audio Permission
```bash
curl -X POST http://localhost:5000/api/interaction/sessions/SESSION_ID/audio-permission \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "allow": true}'
```

#### Mute User
```bash
curl -X POST http://localhost:5000/api/interaction/sessions/SESSION_ID/mute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "mute": true}'
```

## Common Issues & Solutions

### Sessions not showing for mentor
- **Check**: Is the user actually assigned as a mentor?
- **Check**: Are you looking at `/mentor` dashboard?
- **Fix**: Create session with correct mentor ID

### Students can't see available sessions
- **Check**: Are they enrolled in the course?
- **Check**: Is session still scheduled (not started yet) or active?
- **Fix**: Ensure course enrollment is correct

### Chat messages not appearing
- **Check**: Are both users in the same active session?
- **Check**: Is the session status "active"?
- **Fix**: Ensure session has been started

### Recording file not found
- **Check**: Was session properly ended (not just closed)?
- **Check**: Does `/uploads/recordings/` folder exist?
- **Fix**: Clear browser cache if seeing old data

## File Structure for Reference

```
Backend:
├── src/
│   ├── models/InteractionSession.js
│   ├── routes/interaction.routes.js
│   └── server.js (routes registered)

Frontend:
├── src/
│   ├── app/router.tsx (routes added)
│   ├── features/
│   │   ├── admin/interaction/InteractionSessionsManagement.tsx
│   │   ├── interaction/
│   │   │   ├── MentorSessionsList.tsx
│   │   │   ├── UserSessionsList.tsx
│   │   │   ├── InteractionBoard.tsx
│   │   │   └── SessionReview.tsx
│   │   ├── mentor/dashboard/MentorHome.tsx (updated)
│   │   └── user/dashboard/UserHome.tsx (updated)
```

## Next Steps

### For Development
1. Implement real-time chat with Socket.io
2. Add actual audio/video streaming
3. Implement canvas drawing for whiteboard
4. Add email notifications
5. Create mobile-responsive design

### For Production
1. Set up recordings storage (cloud storage like S3)
2. Implement proper error handling
3. Add rate limiting
4. Set up monitoring and logging
5. Configure CORS properly
6. Add input validation and sanitization
7. Implement proper authentication tokens refresh

## Support
Refer to `INTERACTION_BOARD_README.md` for complete documentation.
