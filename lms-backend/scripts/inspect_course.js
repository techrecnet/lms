require('dotenv').config({ path: `${__dirname}/../.env` });
const connectDB = require('../src/config/db');
const Course = require('../src/models/Course');
// ensure related models are registered for populate
const Section = require('../src/models/Section');
const Topic = require('../src/models/Topic');
const TopicLibrary = require('../src/models/TopicLibrary');

const courseId = process.argv[2] || '699d505b023618f966d8157a';

async function main() {
  await connectDB();
  const course = await Course.findById(courseId).populate({
    path: 'sections',
    options: { sort: { order: 1 } },
    populate: [
      { path: 'topics', options: { sort: { order: 1, createdAt: 1 } } },
      { path: 'libraryTopics' }
    ]
  });
  if (!course) {
    console.error('Course not found:', courseId);
    process.exit(1);
  }

  console.log('Course:', course.title, course._id.toString());
  for (const sec of course.sections) {
    console.log('\nSection:', sec.title, sec._id.toString());
    console.log('  Topics:');
    for (const t of sec.topics) {
      console.log('   -', t.title, '| content length:', (t.content||'').length);
    }
    console.log('  LibraryTopics:');
    for (const lt of sec.libraryTopics) {
      console.log('   -', lt.title, '| content length:', (lt.content||'').length, '| aiSummary length:', (lt.aiSummary||'').length);
    }
  }
  process.exit(0);
}

main().catch(err=>{console.error(err);process.exit(1);});
