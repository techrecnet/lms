const mongoose = require('mongoose')
const { MONGO_URI } = process.env
const Progress = require('../models/Progress')
const User = require('../models/User')
const Course = require('../models/Course')
const mailer = require('../services/mail.service')

async function run() {
  await mongoose.connect(MONGO_URI)

  // Weekly progress: summarize progress for each user for their courses
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const progresses = await Progress.find({ updatedAt: { $gte: oneWeekAgo } }).populate('course').populate('user')

  const byUser = {}
  progresses.forEach(p => {
    const uid = String(p.user._id)
    byUser[uid] = byUser[uid] || { email: p.user.email, name: p.user.name, items: [] }
    // compute percent complete roughly
    const total = (p.completedTopics?.length || 0) + (p.completedLibraryTopics?.length || 0)
    const percent = Math.min(100, Math.round((total / ((p.course?.__topicCount || 1))) * 100))
    byUser[uid].items.push({ courseTitle: p.course?.title || 'Course', progress: percent })
  })

  for (const uid of Object.keys(byUser)) {
    try { await mailer.sendWeeklyProgressMail(byUser[uid]) } catch (e) { console.error(e.message) }
  }

  // Inactivity: users with progress but lastCheckedIn > 3 days
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  const inactive = await Progress.find({ lastCheckedIn: { $lt: threeDaysAgo } }).populate('course').populate('user')
  const inactiveByUser = {}
  inactive.forEach(p => {
    const uid = String(p.user._id)
    inactiveByUser[uid] = inactiveByUser[uid] || { user: p.user, courses: [] }
    inactiveByUser[uid].courses.push(p.course)
  })
  for (const uid of Object.keys(inactiveByUser)) {
    const { user, courses } = inactiveByUser[uid]
    try { await mailer.sendInactivityReminder(user, courses) } catch (e) { console.error(e.message) }
  }

  // Course completion reminder: progress older than 45 days and not completed
  const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
  const oldProgress = await Progress.find({ createdAt: { $lt: fortyFiveDaysAgo } }).populate('course').populate('user')
  for (const p of oldProgress) {
    // determine complete: if completedSections length equals course sections count
    const completed = p.completedSections?.length || 0
    // fallback: if not completed (this is heuristic)
    if (completed === 0 || completed < (p.course?.sections?.length || 1)) {
      try { await mailer.sendCourseCompletionReminder(p.user, p.course) } catch (e) { console.error(e.message) }
    }
  }

  await mongoose.disconnect()
}

if (require.main === module) {
  run().then(() => console.log('mail jobs done')).catch(err => { console.error(err); process.exit(1) })
}
