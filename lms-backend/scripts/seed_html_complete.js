require('dotenv').config({ path: `${__dirname}/../.env` });
const connectDB = require('../src/config/db');
const TopicLibrary = require('../src/models/TopicLibrary');
const Course = require('../src/models/Course');
const Section = require('../src/models/Section');
const Topic = require('../src/models/Topic');

const HTML_CURRICULUM = {
  'Introduction to HTML': [
    'Overview of Web Technologies',
    'History and Evolution of HTML',
    'Understanding HTML Document Structure',
    'Setting Up a Development Environment',
    'Basic Tags and Elements'
  ],
  'HTML Document Structure': [
    'HTML Page Layout and Boilerplate Code',
    'DOCTYPE Declaration and Character Encoding',
    'Head Section Elements: <title>, <meta>, <link>, <script>',
    'Body Section and Basic Page Setup'
  ],
  'HTML Text Formatting & Elements': [
    'Headings (<h1> to <h6>)',
    'Paragraphs (<p>) and Line Breaks (<br>)',
    'Bold, Italic, Underline, and Other Formatting Tags',
    'Lists: Ordered (<ol>) and Unordered (<ul>)',
    'Blockquote, Preformatted Text, and Code Tag'
  ],
  'HTML Images & Multimedia': [
    'Inserting Images (<img>) and Image Attributes',
    'Responsive Images and Image Optimization',
    'Adding Audio (<audio>) and Video (<video>)',
    'Embedding External Media (YouTube, Vimeo, etc.)'
  ],
  'HTML Links & Navigation': [
    'Creating Hyperlinks (<a>)',
    'Absolute vs. Relative URLs',
    'Target Attribute and Linking to Different Sections',
    'Anchor Links and Bookmarking'
  ],
  'HTML Tables': [
    'Creating Tables with <table>, <tr>, <td>, <th>',
    'Merging Rows and Columns (rowspan, colspan)',
    'Styling Tables with CSS',
    'Nested Tables and Accessibility Features'
  ],
  'HTML Forms & Input Elements': [
    'Creating Forms (<form>) and Form Attributes',
    'Input Fields (<input>), Textareas, Radio Buttons, Checkboxes',
    'Dropdowns (<select>), Date Pickers, and File Uploads',
    'Form Validation and HTML5 Attributes',
    'Using <label> and <fieldset> for Better Accessibility'
  ],
  'HTML5 Advanced Elements & Features': [
    'Introduction to HTML5',
    'New Semantic Elements (<article>, <section>, <aside>, <nav>)',
    'Canvas API (<canvas>) for Graphics and Animations',
    'SVG (Scalable Vector Graphics) in HTML',
    'Data Attributes and Custom Attributes'
  ]
};

async function createOrGetTopicLibrary(title) {
  let doc = await TopicLibrary.findOne({ title });
  if (!doc) {
    doc = await TopicLibrary.create({
      title,
      content: '',
      audio: '',
      aiSummary: '',
      courseIds: []
    });
  }
  return doc;
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB Connected\n');

    // Get or create course
    const courseTitle = 'HTML';
    let course = await Course.findOne({ title: courseTitle });
    if (!course) {
      course = await Course.create({
        title: courseTitle,
        description: 'Complete HTML course covering basics to advanced topics',
        sections: []
      });
      console.log('✅ Created Course:', course.title);
    } else {
      console.log('✅ Using existing Course:', course.title);
    }

    let sectionOrder = 1;
    for (const [sectionTitle, topicTitles] of Object.entries(HTML_CURRICULUM)) {
      console.log(`\n📚 Processing Section: ${sectionTitle}`);
      
      // Create or get section
      let section = await Section.findOne({ course: course._id, title: sectionTitle });
      if (!section) {
        section = await Section.create({
          course: course._id,
          title: sectionTitle,
          order: sectionOrder,
          libraryTopics: [],
          topics: []
        });
        console.log(`  ✅ Created Section`);
      } else {
        console.log(`  ✅ Using existing Section`);
      }
      
      const topicIds = [];
      const libraryTopicIds = [];

      for (let i = 0; i < topicTitles.length; i++) {
        const topicTitle = topicTitles[i];
        
        // Create TopicLibrary entry
        const libraryTopic = await createOrGetTopicLibrary(topicTitle);
        libraryTopicIds.push(libraryTopic._id);
        console.log(`    ✅ TopicLibrary: ${topicTitle}`);
        
        // Create Topic entry linked to section
        let topic = await Topic.findOne({ section: section._id, title: topicTitle });
        if (!topic) {
          topic = await Topic.create({
            section: section._id,
            title: topicTitle,
            order: i + 1,
            contentType: 'text',
            content: '',
            pdf: ''
          });
          console.log(`    ✅ Topic: ${topicTitle}`);
        } else {
          console.log(`    ✅ Topic exists: ${topicTitle}`);
        }
        topicIds.push(topic._id);
      }

      // Update section with all topic and library topic IDs
      const existingTopicIds = section.topics.map(String);
      const newTopicIds = topicIds.map(String).filter(id => !existingTopicIds.includes(id));
      
      const existingLibraryIds = section.libraryTopics.map(String);
      const newLibraryIds = libraryTopicIds.map(String).filter(id => !existingLibraryIds.includes(id));

      if (newTopicIds.length > 0) {
        section.topics = section.topics.concat(newTopicIds);
      }
      
      if (newLibraryIds.length > 0) {
        section.libraryTopics = section.libraryTopics.concat(newLibraryIds);
      }

      await section.save();

      // Add section to course if not already there
      const sectionIdStr = section._id.toString();
      const courseHasSection = course.sections.map(String).includes(sectionIdStr);
      if (!courseHasSection) {
        course.sections.push(section._id);
        await course.save();
      }

      sectionOrder++;
    }

    console.log('\n✅✅✅ Seeding complete!\n');
    console.log(`📖 Course: ${course.title}`);
    console.log(`📚 Sections: ${Object.keys(HTML_CURRICULUM).length}`);
    console.log(`📝 Total Topics: ${Object.values(HTML_CURRICULUM).flat().length}`);
    console.log(`📚 All topics also added to TopicLibrary\n`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

main();
