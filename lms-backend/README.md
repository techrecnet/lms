# LMS Backend (Enterprise Update)

## Run
```bash
npm i
npm run dev
```

## Base URL
http://localhost:5000/api

## New endpoints added for Enterprise Frontend
- Institutes (admin):
  - GET /institutes
  - POST /institutes
  - DELETE /institutes/:id

- Courses:
  - GET /courses
  - GET /courses/:id (nested populate)
  - POST /courses (admin)
  - DELETE /courses/:id (admin)
  - POST /courses/:id/sections (admin)

- Sections:
  - POST /sections/:sectionId/chapters (admin)

- Chapters:
  - POST /chapters/:chapterId/topics (admin)

- Batches:
  - GET /batch (admin)
  - POST /batch (admin)
  - PUT /batch/:id/assign-course (admin)
  - DELETE /batch/:id (admin)

- User assigned courses:
  - GET /users/me/courses (auth)

Auth accepts `Authorization: Bearer <token>` or plain token.
