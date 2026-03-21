const nodemailer = require('nodemailer')
const { MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASS, MAIL_FROM, FRONTEND_URL } = process.env

const transporter = nodemailer.createTransport({
  host: MAIL_HOST || 'smtp.example.com',
  port: Number(MAIL_PORT) || 587,
  secure: MAIL_SECURE === 'true',
  auth: MAIL_USER ? { user: MAIL_USER, pass: MAIL_PASS } : undefined,
  logger: true,
  debug: true,
  tls: {
    // allow self-signed certs
    rejectUnauthorized: MAIL_SECURE === 'true' ? false : true
  }
})

// Verify transporter connectivity early and log result (non-fatal)
transporter.verify().then(() => {
  console.log('Mail transporter verified')
}).catch((err) => {
  console.error('Mail transporter verification failed:', err && err.message ? err.message : err)
})

async function sendMail({ to, subject, html, text }) {
  const msg = {
    from: MAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    html,
    text
  }
  return transporter.sendMail(msg)
}

function signupHtml(user, password) {
  const url = `${FRONTEND_URL || 'http://localhost:5173'}/courses`
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
    <div style="max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px">
      <div style="text-align:center;padding-bottom:12px">
        <img src="${FRONTEND_URL || 'http://localhost:5173'}/images/logo-white.png" alt="Recent" style="height:40px;" />
      </div>
      <h2 style="color:#111">Welcome to Recent LMS</h2>
      <p>Hi ${user.name || user.email},</p>
      <p>Your account was created successfully.</p>
      ${password ? `<p>Your temporary password is: <strong style="letter-spacing:1px">${password}</strong></p>
      <p style="color:#666;font-size:13px">Please log in and change your password from your profile.</p>` : ''}
      <p>Click below to start exploring courses:</p>
      <p style="text-align:center"><a href="${url}" style="display:inline-block;padding:12px 20px;background:#7c3aed;color:#fff;border-radius:6px;text-decoration:none">Browse Courses</a></p>
      <hr />
      <p style="color:#666;font-size:13px">If you didn't sign up for Recent LMS, you can ignore this email.</p>
    </div>
  </div>
  `
}

function forgotHtml(token) {
  const url = `${FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
    <div style="max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px">
      <div style="text-align:center;padding-bottom:12px">
        <img src="${FRONTEND_URL || 'http://localhost:5173'}/images/logo-white.png" alt="Recent" style="height:40px;" />
      </div>
      <h2 style="color:#111">Password Reset Request</h2>
      <p>We received a request to reset your password. Click the button below to choose a new password.</p>
      <p style="text-align:center"><a href="${url}" style="display:inline-block;padding:12px 20px;background:#e11d48;color:#fff;border-radius:6px;text-decoration:none">Reset Password</a></p>
      <p style="color:#666;font-size:13px">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  </div>
  `
}

function courseJoiningHtml(user, course) {
  return `
    <p>Hi ${user.name || user.email},</p>
    <p>You're enrolled in <strong>${course.title}</strong>.</p>
    <p>Start learning: <a href="${FRONTEND_URL || 'http://localhost:5173'}/courses/${course._id}">Open Course</a></p>
    <p>Good luck!</p>
  `
}

function weeklyProgressHtml(summary) {
  return `
    <p>Hi ${summary.name || 'Learner'},</p>
    <p>Here's your weekly progress summary:</p>
    <ul>
      ${summary.items.map(i => `<li>${i.courseTitle}: ${i.progress}% complete</li>`).join('')}
    </ul>
    <p>Keep going — you're doing great!</p>
  `
}

function inactivityHtml(user, courses) {
  return `
    <p>Hi ${user.name || user.email},</p>
    <p>We noticed you haven't viewed any topics in the last 3 days for these courses:</p>
    <ul>
      ${courses.map(c => `<li>${c.title}</li>`).join('')}
    </ul>
    <p>Jump back in to continue learning.</p>
  `
}

function completionReminderHtml(user, course) {
  return `
    <p>Hi ${user.name || user.email},</p>
    <p>This is a reminder to complete <strong>${course.title}</strong> within 45 days.</p>
    <p>Open course: <a href="${FRONTEND_URL || 'http://localhost:5173'}/courses/${course._id}">Open Course</a></p>
  `
}

module.exports = {
  sendMail,
  sendSignupMail: (user, password) => sendMail({ to: user.email, subject: 'Welcome to Recent LMS', html: signupHtml(user, password) }),
  sendForgotPasswordMail: (email, token) => sendMail({ to: email, subject: 'Reset your Recent LMS password', html: forgotHtml(token) }),
  sendCourseJoiningMail: (user, course) => sendMail({ to: user.email, subject: `Enrolled: ${course.title}`, html: courseJoiningHtml(user, course) }),
  sendWeeklyProgressMail: (summary) => sendMail({ to: summary.email, subject: 'Your weekly progress summary', html: weeklyProgressHtml(summary) }),
  sendInactivityReminder: (user, courses) => sendMail({ to: user.email, subject: 'We miss you at Recent LMS', html: inactivityHtml(user, courses) }),
  sendCourseCompletionReminder: (user, course) => sendMail({ to: user.email, subject: `Complete ${course.title} within 45 days`, html: completionReminderHtml(user, course) })
}
