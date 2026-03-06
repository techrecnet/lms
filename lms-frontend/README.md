# Enterprise LMS Frontend (SaaS)

## Setup
```bash
npm i
npm run dev
```

## Backend
Configured base URL: `http://localhost:5000/api`

### Works with your current backend
- POST /auth/login  -> expects { token }
- POST /auth/signup
- GET /courses
- POST /courses (admin)
- GET /batch
- POST /batch (admin)
- PUT /batch/:id/assign-course (admin)

### Recommended backend endpoints for full SaaS features (used by UI where available)
- Institutes:
  - GET /institutes
  - POST /institutes
  - DELETE /institutes/:id
- Course Builder nested:
  - GET /courses/:id (nested sections/chapters/topics)
  - POST /courses/:id/sections
  - POST /sections/:sectionId/chapters
  - POST /chapters/:chapterId/topics
- User assigned courses:
  - GET /users/me/courses

If any of these are missing, the UI will show friendly fallbacks.
