const axios = require('axios')

// Usage: ADMIN_TOKEN=your_admin_jwt API_BASE=http://localhost:3000/api node scripts/seedTopics.cjs

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  console.error('Please provide ADMIN_TOKEN env var with an admin JWT')
  process.exit(1)
}

const topicsStructure = [
  {
    section: 'Introduction to HTML',
    items: [
      'Overview of Web Technologies',
      'History and Evolution of HTML',
      'Understanding HTML Document Structure',
      'Setting Up a Development Environment',
      'Basic Tags and Elements'
    ]
  },
  {
    section: 'HTML Document Structure',
    items: [
      'HTML Page Layout and Boilerplate Code',
      'DOCTYPE Declaration and Character Encoding',
      'Head Section Elements: <title>, <meta>, <link>, <script>',
      'Body Section and Basic Page Setup'
    ]
  },
  {
    section: 'HTML Text Formatting & Elements',
    items: [
      'Headings (<h1> to <h6>)',
      'Paragraphs (<p>) and Line Breaks (<br>)',
      'Bold, Italic, Underline, and Other Formatting Tags',
      'Lists: Ordered (<ol>) and Unordered (<ul>)',
      'Blockquote, Preformatted Text, and Code Tag'
    ]
  },
  {
    section: 'HTML Images & Multimedia',
    items: [
      'Inserting Images (<img>) and Image Attributes',
      'Responsive Images and Image Optimization',
      'Adding Audio (<audio>) and Video (<video>)',
      'Embedding External Media (YouTube, Vimeo, etc.)'
    ]
  },
  {
    section: 'HTML Links & Navigation',
    items: [
      'Creating Hyperlinks (<a>)',
      'Absolute vs. Relative URLs',
      'Target Attribute and Linking to Different Sections',
      'Anchor Links and Bookmarking'
    ]
  },
  {
    section: 'HTML Tables',
    items: [
      'Creating Tables with <table>, <tr>, <td>, <th>',
      'Merging Rows and Columns (rowspan, colspan)',
      'Styling Tables with CSS',
      'Nested Tables and Accessibility Features'
    ]
  },
  {
    section: 'HTML Forms & Input Elements',
    items: [
      'Creating Forms (<form>) and Form Attributes',
      'Input Fields (<input>), Textareas, Radio Buttons, Checkboxes',
      'Dropdowns (<select>), Date Pickers, and File Uploads',
      'Form Validation and HTML5 Attributes',
      'Using <label> and <fieldset> for Better Accessibility'
    ]
  },
  {
    section: 'HTML5 Advanced Elements & Features',
    items: [
      'Introduction to HTML5',
      'New Semantic Elements (<article>, <section>, <aside>, <nav>)',
      'Canvas API (<canvas>) for Graphics and Animations',
      'SVG (Scalable Vector Graphics) in HTML',
      'Data Attributes and Custom Attributes'
    ]
  }
]

async function findCourseIdByName(nameFragment) {
  const res = await axios.get(`${API_BASE}/courses`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
  })
  const courses = res.data || []
  const found = courses.find(c => (c.title || '').toLowerCase().includes(nameFragment.toLowerCase()))
  return found ? found._id : null
}

async function createTopic(courseId, title, content) {
  const form = new URLSearchParams()
  form.append('courseIds', JSON.stringify([courseId]))
  form.append('title', title)
  form.append('content', content)

  const res = await axios.post(`${API_BASE}/topics-lib`, form.toString(), {
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return res.data
}

async function run() {
  try {
    const courseId = await findCourseIdByName('html')
    if (!courseId) {
      console.error('Could not find a course with title containing "html". Please create the HTML course first or modify the script.')
      process.exit(1)
    }

    for (const section of topicsStructure) {
      // Create a section entry
      const sectionContent = `<p><strong>Section:</strong> ${section.section}</p>`
      console.log('Creating section:', section.section)
      await createTopic(courseId, `Section: ${section.section}`, sectionContent)

      // Create subtopics
      for (const item of section.items) {
        const content = `<p>${item}</p><p>Content for ${item} (please edit to add more detailed notes).</p>`
        console.log('  Creating topic:', item)
        await createTopic(courseId, `${section.section} — ${item}`, content)
      }
    }

    console.log('Seeding complete.')
  } catch (err) {
    console.error('Error seeding topics:', err.response ? err.response.data : err.message)
  }
}

run()
