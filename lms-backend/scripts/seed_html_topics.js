require('dotenv').config({ path: `${__dirname}/../.env` });
const connectDB = require('../src/config/db');
const TopicLibrary = require('../src/models/TopicLibrary');
const Course = require('../src/models/Course');
const Section = require('../src/models/Section');

const HTML_TOPICS = [
  'Overview of Web Technologies',
  'History and Evolution of HTML',
  'Understanding HTML Document Structure',
  'Setting Up a Development Environment',
  'Basic Tags and Elements'
];

async function upsertTopicLibrary(title) {
  const doc = await TopicLibrary.findOneAndUpdate(
    { title },
    { $setOnInsert: { title, content: '', audio: '', aiSummary: '' } },
    { upsert: true, new: true }
  );
  return doc;
}

async function main() {
  await connectDB();

  const created = [];
  for (const t of HTML_TOPICS) {
    const doc = await upsertTopicLibrary(t);
    created.push(doc);
    console.log('Ensured TopicLibrary:', doc.title, doc._id.toString());
  }

  // Create or get course
  const courseTitle = 'HTML Fundamentals (Seed)';
  let course = await Course.findOne({ title: courseTitle });
  if (!course) {
    course = await Course.create({
      title: courseTitle,
      description: 'Seeded course for HTML topics',
    });
    console.log('Created Course:', course.title, course._id.toString());
  } else {
    console.log('Found existing Course:', course.title, course._id.toString());
  }

  // Create or update section
  const sectionTitle = 'Introduction to HTML';
  let section = await Section.findOne({ course: course._id, title: sectionTitle });
  const libraryIds = created.map(d => d._id);

  if (!section) {
    section = await Section.create({
      course: course._id,
      title: sectionTitle,
      order: 1,
      libraryTopics: libraryIds
    });
    console.log('Created Section:', section.title, section._id.toString());
  } else {
    // Merge libraryTopics without duplicates
    const existing = section.libraryTopics.map(String);
    const toAdd = libraryIds.map(String).filter(id => !existing.includes(id));
    if (toAdd.length) {
      section.libraryTopics = section.libraryTopics.concat(toAdd);
      await section.save();
      console.log('Updated Section libraryTopics:', section._id.toString());
    } else {
      console.log('Section already contains all library topics');
    }
  }

  // Ensure section is referenced by course
  const secIdStr = section._id.toString();
  if (!course.sections.map(String).includes(secIdStr)) {
    course.sections.push(section._id);
    await course.save();
    console.log('Added section to course.sections');
  }

  console.log('\nSeeding complete. Summary:');
  console.log('- Course:', course.title, course._id.toString());
  console.log('- Section:', section.title, section._id.toString());
  console.log('- Topics added to TopicLibrary:');
  created.forEach(d => console.log('  -', d.title, d._id.toString()));

  process.exit(0);
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
