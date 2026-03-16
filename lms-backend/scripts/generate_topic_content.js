require('dotenv').config({ path: `${__dirname}/../.env` });
const connectDB = require('../src/config/db');
const TopicLibrary = require('../src/models/TopicLibrary');
const Topic = require('../src/models/Topic');

const TOPIC_CONTENT = {
  'Overview of Web Technologies': {
    content: `Web technologies form the foundation of modern internet applications. They consist of three main pillars:

1. **HTML (HyperText Markup Language)**: Provides the structure and content of web pages. It uses a system of tags and elements to define the meaning and presentation of web content.

2. **CSS (Cascading Style Sheets)**: Handles the styling and layout of web pages. It allows developers to separate content from presentation, making websites more maintainable and responsive.

3. **JavaScript**: Adds interactivity and dynamic behavior to web pages. It enables client-side scripting, allowing pages to respond to user actions without requiring server communication.

Additional important technologies include:
- **HTTP/HTTPS**: Protocols for transferring data over the internet
- **DNS**: System for converting domain names to IP addresses
- **Web Servers**: Software that serves web content to clients
- **Databases**: Store and manage data for web applications
- **APIs**: Allow communication between different applications and services`,
    aiSummary: 'Web technologies encompass HTML for structure, CSS for styling, JavaScript for interactivity, and supporting protocols and services that enable modern web applications.'
  },
  'History and Evolution of HTML': {
    content: `HTML has evolved significantly since its inception:

**HTML 1.0 (1991)**: Tim Berners-Lee created the original specification with basic elements like paragraphs, headings, lists, and links.

**HTML 2.0 (1995)**: First standard HTML specification, introduced forms for user input.

**HTML 3.2 (1997)**: Added support for tables, applets, and text flow around images.

**HTML 4.01 / XHTML (1999-2002)**: Introduced stricter syntax requirements and better separation of content from presentation. XHTML required well-formed XML.

**HTML5 (2014-present)**: Modern standard with semantic elements, improved form controls, canvas for graphics, video/audio native support, and APIs for offline functionality, geolocation, and local storage.

Key milestones:
- Introduction of semantic elements (<article>, <section>, <nav>)
- Native multimedia support without plugins
- Canvas API for drawing graphics
- SVG integration for vector graphics
- Improved accessibility features
- Mobile-first approach`,
    aiSummary: 'HTML evolved from a simple markup language (1991) through multiple versions to HTML5 (2014), adding semantic elements, multimedia support, APIs, and modern web capabilities.'
  },
  'Understanding HTML Document Structure': {
    content: `A proper HTML document structure is essential for proper rendering and accessibility:

**<!DOCTYPE html>**: Declaration at the very beginning specifying the HTML version. For HTML5, it's simply: <!DOCTYPE html>

**<html> root element**: Contains all other elements. Has a "lang" attribute for document language.

**<head> section**: Contains metadata about the document:
- <title>: Page title displayed in browser tab
- <meta>: Metadata like character encoding, viewport settings, description
- <link>: External resources like CSS stylesheets
- <script>: Internal or linked JavaScript
- <style>: Internal CSS rules

**<body> section**: Contains all visible page content:
- Headings and paragraphs
- Navigation elements
- Main content
- Sidebars and footers
- Media and interactive elements

**Best practices**:
- Always include proper DOCTYPE
- Set character encoding to UTF-8
- Include viewport meta tag for responsive design
- Use semantic HTML5 elements when appropriate
- Keep head information relevant and concise`,
    aiSummary: 'HTML documents require proper structure: DOCTYPE declaration, html root element, head with metadata, and body with visible content. Each section serves specific purposes.'
  },
  'Setting Up a Development Environment': {
    content: `A proper development environment is crucial for efficient web development:

**Text Editors and IDEs**:
- Visual Studio Code: Lightweight, feature-rich, highly customizable
- Sublime Text: Fast, minimal footprint
- WebStorm: Full-featured IDE for web development
- Atom: Hackable, community-driven editor

**Essential Tools**:
- **Version Control**: Git for tracking changes and collaboration
- **Browser DevTools**: Inspect elements, debug CSS/JavaScript, network monitoring
- **Live Server**: Auto-refresh page during development
- **Package Managers**: npm or yarn for managing dependencies
- **Build Tools**: Webpack, Gulp, Grunt for bundling and optimization

**Browser DevTools**:
- Inspector: View and edit HTML
- Console: Debug JavaScript and view errors
- Network tab: Monitor HTTP requests
- Performance tools: Analyze page speed
- Application tab: Inspect storage and caching

**Getting Started**:
1. Choose an editor (VS Code recommended)
2. Install Git
3. Create a project folder
4. Initialize a git repository
5. Start with a basic HTML template
6. Open file in multiple browsers for testing`,
    aiSummary: 'A proper dev environment includes a code editor (VS Code), Git, browser DevTools, and supporting tools. Browser DevTools are essential for inspecting and debugging code.'
  },
  'Basic Tags and Elements': {
    content: `Fundamental HTML tags form the building blocks of web pages:

**Container Elements**:
- <div>: Generic block-level container for grouping
- <span>: Generic inline container for text
- <section>, <article>, <aside>, <nav>: Semantic containers

**Text Elements**:
- <p>: Paragraphs
- <h1> to <h6>: Headings (h1 largest, h6 smallest)
- <strong>, <b>: Bold text (strong is semantic)
- <em>, <i>: Emphasized/italic text (em is semantic)
- <br>: Line break
- <hr>: Horizontal rule

**Lists**:
- <ul>: Unordered list
- <ol>: Ordered list
- <li>: List item

**Links and Media**:
- <a>: Hyperlinks
- <img>: Images
- <video>, <audio>: Multimedia

**Attributes**:
- class: For CSS styling
- id: Unique element identifier
- data-*: Custom data attributes
- alt: Alternative text for images
- href: URL for links
- src: Source for images/media

**Important**: Use semantic elements when possible for better accessibility and SEO.`,
    aiSummary: 'Basic HTML elements include containers (div, span, semantic tags), text elements (headings, paragraphs, emphasis), lists, links, and media. Attributes provide configuration.'
  },
  'HTML Page Layout and Boilerplate Code': {
    content: `A standard HTML5 boilerplate provides the foundation for all pages:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Page description">
    <title>Page Title</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav><!-- Navigation --></nav>
    </header>
    
    <main>
        <section>
            <!-- Main content -->
        </section>
        <aside>
            <!-- Sidebar -->
        </aside>
    </main>
    
    <footer>
        <!-- Footer content -->
    </footer>
    
    <script src="script.js"></script>
</body>
</html>
\`\`\`

**Key components**:
- **Doctype**: HTML5 specification
- **Language attribute**: Improves accessibility
- **Meta charset**: UTF-8 for character encoding
- **Viewport meta**: Responsive design for mobile
- **Title**: Unique for each page
- **Semantic structure**: header, nav, main, aside, footer
- **Scripts at end**: Better page load performance`,
    aiSummary: 'HTML boilerplate includes DOCTYPE, meta tags for charset and viewport, semantic layout with header/main/footer, and proper script placement for optimal performance.'
  },
  'DOCTYPE Declaration and Character Encoding': {
    content: `DOCTYPE and character encoding are critical for proper page rendering:

**DOCTYPE Declaration**:
- Tells browser which HTML version to expect
- HTML5: \`<!DOCTYPE html>\`
- Must be first line of document
- Prevents "quirks mode" rendering
- Case-insensitive but conventionally lowercase

**Character Encoding**:
- **UTF-8**: Universal standard, supports all languages and symbols
- Specified in meta tag: \`<meta charset="UTF-8">\`
- Must be in first 1024 bytes of document
- Prevents character display issues (special symbols, accents, non-Latin scripts)

**Common encoding issues**:
- Without proper encoding: Mojibake (garbled text)
- Different encodings for HTML and CSS can cause mismatches
- Database encoding must match

**Best practices**:
- Always use UTF-8
- Place charset meta tag immediately after opening <head>
- Ensure files are saved as UTF-8
- Set server to serve UTF-8 headers
- Test with international characters`,
    aiSummary: 'DOCTYPE html must be the first line to enable standards mode. Character encoding (preferably UTF-8) must be declared in meta charset tag to prevent character display issues.'
  },
  'Head Section Elements: <title>, <meta>, <link>, <script>': {
    content: `The <head> section contains crucial metadata and resource links:

**<title> Element**:
- Appears in browser tab and page history
- Used by search engines for ranking
- Should be unique and descriptive (50-60 characters)
- Examples: "Product Catalog | Online Store"

**<meta> Tags**:
- \`<meta charset="UTF-8">\`: Character encoding
- \`<meta name="viewport" content="width=device-width, initial-scale=1">\`: Responsive design
- \`<meta name="description" content="...">\`: Page description for search results
- \`<meta name="keywords" content="...">\`: Related keywords
- \`<meta name="author" content="...">\`: Page author
- \`<meta property="og:image" content="...">\`: Social media sharing

**<link> Elements**:
- \`<link rel="stylesheet" href="style.css">\`: External CSS
- \`<link rel="icon" href="favicon.ico">\`: Page icon
- \`<link rel="canonical" href="...">\`: Preferred page version for SEO

**<script> in Head**:
- Can be placed in <head> or before </body>
- \`<script src="file.js"></script>\`: External script
- \`<script>/* inline code */</script>\`: Inline script
- Use \`async\` or \`defer\` attributes to optimize loading

**Best practice**: Keep head clean, place non-critical scripts in body`,
    aiSummary: 'Head section contains <title> for SEO, <meta> tags for metadata, <link> for resources, and <script> for JavaScript. Each serves distinct purposes for page configuration.'
  },
  'Body Section and Basic Page Setup': {
    content: `The <body> section contains all visible page content:

**Semantic Structure**:
- <header>: Top section with logo, branding, main navigation
- <nav>: Navigation menus and links
- <main>: Primary page content (only one per page)
- <article>: Self-contained content piece
- <section>: Thematic grouping of content
- <aside>: Sidebar, tangential content
- <footer>: Bottom section with copyright, links, contact

**Basic body setup**:
\`\`\`html
<body>
    <header>Header content</header>
    <nav>Navigation</nav>
    <main>
        <article>Article 1</article>
        <section>
            <h2>Section 1</h2>
            <p>Content</p>
        </section>
    </main>
    <aside>Sidebar</aside>
    <footer>Footer</footer>
</body>
\`\`\`

**Accessibility considerations**:
- Use semantic elements appropriately
- Ensure proper heading hierarchy
- Include alt text for images
- Use ARIA labels when needed
- Ensure keyboard navigation works

**Performance tips**:
- Minimize DOM depth
- Use semantic HTML reduces CSS overhead
- Load resources efficiently
- Optimize content for loading`,
    aiSummary: 'Body element contains semantic HTML5 structures (header, nav, main, article, section, aside, footer) that organize content, improve accessibility, and enhance SEO.'
  },
  'Headings (<h1> to <h6>)': {
    content: `Headings structure content and improve accessibility and SEO:

**Heading Hierarchy**:
- <h1>: Main page title (only one per page)
- <h2>: Major section headings
- <h3>: Subsections
- <h4>: Sub-subsections
- <h5>, <h6>: Rarely used

**Proper usage**:
- Use headings in logical order
- Don't skip levels (h1 → h3 is wrong)
- Each page should have exactly one <h1>
- Use headings for structure, not styling
- Keep headings concise and descriptive

**Example structure**:
\`\`\`html
<h1>Website Title</h1>
<h2>Main Topic</h2>
<p>Content...</p>
<h3>Subtopic</h3>
<p>Content...</p>
<h2>Another Topic</h2>
\`\`\`

**SEO & Accessibility benefits**:
- Search engines use headings to understand content
- Screen readers navigate by headings
- Proper structure improves readability
- Helps establish content hierarchy
- Improves user experience

**Styling headings with CSS**:
- Keep semantic structure, style with CSS
- Avoid using headings for visual effects
- Use classes for consistent styling`,
    aiSummary: 'Headings (h1-h6) establish content hierarchy and must be used in logical order with one h1 per page. Proper heading structure improves SEO, accessibility, and content organization.'
  },
  'Paragraphs (<p>) and Line Breaks (<br>)': {
    content: `Paragraphs and line breaks are fundamental text elements:

**<p> Paragraph Element**:
- Creates block-level text container
- Browser adds automatic margins above/below
- Separates content logically
- Use for complete thoughts or sentences
- Closable element (requires </p>)

**Paragraph usage**:
\`\`\`html
<p>This is a complete paragraph with multiple sentences.</p>
<p>This is another paragraph, separated with visual space.</p>
\`\`\`

**<br> Line Break Element**:
- Self-closing tag (no closing tag needed)
- Creates line break without paragraph spacing
- Use for formatting within content (addresses, poetry)
- Don't overuse for spacing (use CSS instead)

**When to use <br>**:
- Addresses: "Street Address<br>City, State ZIP"
- Poetry or formatted text
- Line breaks within continuous content

**When NOT to use <br>**:
- Creating spacing between paragraphs (use CSS margin)
- Fake paragraph separation
- Excessive use for formatting

**Best practices**:
- One idea per paragraph
- Use paragraphs for semantic meaning
- Use CSS for styling and spacing
- Use <br> sparingly and semantically`,
    aiSummary: '<p> tags group text logically with margins, while <br> creates hard line breaks. Use <p> for paragraphs and <br> sparingly for formatting like addresses or poetry.'
  },
  'Bold, Italic, Underline, and Other Formatting Tags': {
    content: `Semantic and visual formatting tags provide emphasis:

**Bold Text**:
- <strong>: Semantic (strong importance), displays bold
- <b>: Visual bold without semantic meaning
- Use <strong> for actual importance, <b> for styling

**Italic/Emphasis**:
- <em>: Semantic emphasis, displays italic
- <i>: Visual italic without semantic meaning
- Use <em> for emphasis, <i> for styling

**Example**:
\`\`\`html
<p><strong>Important:</strong> This is critical information.</p>
<p><em>Note:</em> Please read carefully.</p>
<p><b>Keyword</b> - Highlighting without semantic meaning</p>
\`\`\`

**Other formatting tags**:
- <mark>: Highlighting/marking text
- <del>: Strikethrough text (deleted)
- <ins>: Underlined text (inserted)
- <sub>: Subscript (H₂O)
- <sup>: Superscript (E=mc²)
- <code>: Inline code
- <kbd>: Keyboard input
- <samp>: Sample output
- <var>: Variable in equations

**Accessibility and SEO**:
- Semantic tags improve accessibility
- Screen readers interpret <strong> and <em> differently
- Improves search engine understanding
- Makes code more maintainable

**Best practices**:
- Use semantic tags when meaning is present
- Don't overuse formatting
- Use CSS for most visual styling
- Combine with CSS for better control`,
    aiSummary: 'Use semantic tags <strong> and <em> for meaning, <b> and <i> for styling. Additional tags like <mark>, <del>, <sub>, <sup> provide specific formatting. Semantic choice improves accessibility.'
  },
  'Lists: Ordered (<ol>) and Unordered (<ul>)': {
    content: `Lists organize related items effectively:

**Unordered Lists (<ul>)**:
- Used when order doesn't matter
- Displays with bullet points by default
- Structure: <ul><li>Item</li><li>Item</li></ul>

**Example**:
\`\`\`html
<ul>
    <li>Apples</li>
    <li>Oranges</li>
    <li>Bananas</li>
</ul>
\`\`\`

**Ordered Lists (<ol>)**:
- Used when sequence matters
- Displays with numbers by default
- Attributes: start, reversed
- Structure: <ol><li>Item</li><li>Item</li></ol>

**Example**:
\`\`\`html
<ol>
    <li>First step</li>
    <li>Second step</li>
    <li>Final step</li>
</ol>
\`\`\`

**Description Lists (<dl>)**:
- Used for term-definition pairs
- <dt>Term</dt> and <dd>Definition</dd>

**Nested lists**:
\`\`\`html
<ul>
    <li>Item 1
        <ul>
            <li>Subitem 1a</li>
            <li>Subitem 1b</li>
        </ul>
    </li>
</ul>
\`\`\`

**Best practices**:
- Use semantic list elements
- Don't fake lists with divs or paragraphs
- Nest lists properly for hierarchy
- Use CSS to style list appearance`,
    aiSummary: '<ul> creates unordered (bulleted) lists, <ol> creates ordered (numbered) lists, and <dl> for term-definition pairs. Lists improve content organization and accessibility.'
  },
  'Blockquote, Preformatted Text, and Code Tag': {
    content: `Special semantic tags for specific content types:

**<blockquote> Element**:
- Marks quoted text from other sources
- Creates visual indentation and browser default spacing
- Use with <cite> for source
- Example:
\`\`\`html
<blockquote cite="https://example.com">
    <p>This is a quote from another source.</p>
    <footer>— <cite>Author Name</cite></footer>
</blockquote>
\`\`\`

**<pre> Preformatted Text**:
- Preserves whitespace and line breaks
- Uses monospace font
- Useful for code samples, ASCII art
- Example:
\`\`\`html
<pre>
    Line 1
    Line 2 with spacing
    Line 3
</pre>
\`\`\`

**<code> Code Element**:
- Marks inline code snippets
- Usually styled with monospace font
- Example: \`<code>console.log('hello')</code>\`

**<kbd> Keyboard Input**:
- Indicates keyboard input
- Example: Press <kbd>Ctrl</kbd> + <kbd>C</kbd>

**<samp> Sample Output**:
- Shows program output or sample results
- Example: \`<samp>Error: File not found</samp>\`

**Combining for code blocks**:
\`\`\`html
<pre><code>
function hello() {
    console.log('Hello');
}
</code></pre>
\`\`\`

**Best practices**:
- Use semantic tags appropriately
- Style with CSS for consistency
- Combine tags for clarity`,
    aiSummary: '<blockquote> marks quoted text, <pre> preserves formatting, <code> marks code, <kbd> indicates keyboard input. Use <pre><code> together for code blocks. Each provides semantic meaning.'
  },
  'Inserting Images (<img>) and Image Attributes': {
    content: `Images are essential media elements in modern web pages:

**<img> Element**:
- Self-closing tag (no closing tag)
- Inline element by default
- Essential attributes: src (required), alt (required for accessibility)

**Basic syntax**:
\`\`\`html
<img src="image.jpg" alt="Image description">
\`\`\`

**Essential attributes**:
- **src**: Image file path or URL (required)
- **alt**: Alternative text for accessibility and SEO (required)
- **width**: Image width in pixels
- **height**: Image height in pixels
- **title**: Tooltip text on hover

**Important attributes**:
\`\`\`html
<img src="photo.jpg" 
     alt="A beautiful sunset over mountains"
     width="400" 
     height="300"
     title="Sunset in Mountains">
\`\`\`

**Image formats**:
- **JPEG**: Photos and complex images (lossy compression)
- **PNG**: Graphics with transparency (lossless)
- **GIF**: Animations and simple graphics
- **WebP**: Modern format with better compression
- **SVG**: Vector graphics (scalable)

**Accessibility**:
- Always include descriptive alt text
- Describe image content and purpose
- For decorative images: leave alt empty (alt="")
- Screen readers read alt text

**Best practices**:
- Optimize image file sizes
- Use correct format for content type
- Include width/height to prevent layout shift
- Use lazy loading for performance`,
    aiSummary: '<img> tags require src and alt attributes. Alt text is crucial for accessibility. Use appropriate formats (JPEG for photos, PNG for graphics), and optimize file sizes for performance.'
  },
  'Responsive Images and Image Optimization': {
    content: `Creating images that work across different devices and screen sizes:

**Responsive image techniques**:

**CSS approach**:
\`\`\`css
img {
    max-width: 100%;
    height: auto;
}
\`\`\`

**Picture element** (multiple sources):
\`\`\`html
<picture>
    <source media="(min-width: 768px)" srcset="large.jpg">
    <source media="(min-width: 480px)" srcset="medium.jpg">
    <img src="small.jpg" alt="Responsive image">
</picture>
\`\`\`

**Srcset attribute** (different resolutions):
\`\`\`html
<img src="image.jpg"
     srcset="image-small.jpg 480w,
             image-medium.jpg 768w,
             image-large.jpg 1200w"
     sizes="(max-width: 480px) 100vw,
            (max-width: 768px) 50vw,
            33vw"
     alt="Responsive image">
\`\`\`

**Image optimization**:
- **Compression**: Reduce file size without losing quality
- **Format selection**: JPEG for photos, PNG for graphics
- **Lazy loading**: \`<img loading="lazy">\`
- **WebP**: Modern format with 25-35% better compression
- **CSS sprites**: Combine multiple images
- **SVG**: For icons and vector graphics

**Tools**:
- TinyPNG/TinyJPG: Online image compression
- ImageOptim: Desktop compression
- ImageMagick: Command-line processing
- Online converters: Format conversion

**Best practices**:
- Images typically consume 50% of page bandwidth
- Optimize before uploading
- Use srcset for high-DPI displays
- Provide multiple formats with picture element
- Test on various devices`,
    aiSummary: 'Responsive images use CSS max-width, <picture> element, and srcset attribute for multiple sources. Optimization includes compression, format selection, and lazy loading for better performance.'
  },
  'Adding Audio (<audio>) and Video (<video>)': {
    content: `Native HTML5 media elements eliminate plugin dependencies:

**<audio> Element**:
\`\`\`html
<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
    Your browser doesn't support audio element.
</audio>
\`\`\`

**Audio attributes**:
- **controls**: Show player controls
- **autoplay**: Auto-play on page load (usually blocked)
- **loop**: Repeat when finished
- **muted**: Start muted
- **preload**: "none", "metadata", or "auto"

**<video> Element**:
\`\`\`html
<video controls width="640" height="360">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    Your browser doesn't support video element.
</video>
\`\`\`

**Video attributes**:
- **controls**: Show player controls
- **poster**: Thumbnail before play
- **width**, **height**: Dimensions
- **autoplay**, **loop**, **muted**: Playback options
- **preload**: When to load metadata/content

**Supported formats**:
- Audio: MP3 (most compatible), OGG, WAV
- Video: MP4 (most compatible), WebM, Ogg

**Accessibility**:
- Provide captions with <track> element
- Transcripts for audio content
- Audio descriptions for video

**Performance considerations**:
- Compress media files
- Provide multiple formats
- Use poster attribute for video
- Consider third-party hosting (YouTube, Vimeo)
- Implement lazy loading

**Example with captions**:
\`\`\`html
<video controls>
    <source src="video.mp4">
    <track kind="captions" src="captions.vtt">
</video>
\`\`\``,
    aiSummary: '<audio> and <video> elements provide native multimedia without plugins. Include controls, support multiple formats, provide captions for accessibility, and optimize file sizes.'
  },
  'Embedding External Media (YouTube, Vimeo, etc.)': {
    content: `Embed third-party media for streaming and hosting benefits:

**YouTube embedding**:
\`\`\`html
<iframe width="560" height="315" 
        src="https://www.youtube.com/embed/VIDEO_ID" 
        title="YouTube video player" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
</iframe>
\`\`\`

**Vimeo embedding**:
\`\`\`html
<iframe src="https://player.vimeo.com/video/VIDEO_ID" 
        width="640" height="360" 
        allow="autoplay; fullscreen; picture-in-picture">
</iframe>
\`\`\`

**Responsive iframe wrapper**:
\`\`\`html
<div style="position: relative; overflow: hidden; padding-top: 56.25%;">
    <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            src="embedded_content">
    </iframe>
</div>
\`\`\`

**Benefits of third-party hosting**:
- Auto-optimized delivery
- Reduced bandwidth costs
- Better performance
- Built-in player features
- Analytics built-in
- Automatic mobile adaptation

**Security considerations**:
- Use HTTPS
- Set appropriate permissions in allow attribute
- Validate embed code from source
- Limit third-party tracking

**Accessibility**:
- Provide title attribute
- Ensure keyboard navigation
- Provide transcript/captions
- Test with screen readers

**Other platforms**:
- Spotify: Music embedding
- SlideShare: Presentation embedding
- Google Maps: Map embedding
- Tweet integration: Twitter content`,
    aiSummary: 'Embed external media using <iframe> with appropriate permissions. Third-party hosting (YouTube, Vimeo) offers better performance, automatic optimization, and built-in features.'
  },
  'Creating Hyperlinks (<a>)': {
    content: `Hyperlinks are fundamental to web navigation:

**Basic link syntax**:
\`\`\`html
<a href="url">Link text</a>
\`\`\`

**href attribute** (required):
- Can be absolute URL: href="https://example.com"
- Can be relative: href="/about" or href="page.html"
- Can be page anchor: href="#section"
- Can be email: href="mailto:email@example.com"
- Can be phone: href="tel:+1234567890"

**target attribute**:
- _self: Open in same tab (default)
- _blank: Open in new tab
- _parent: Open in parent frame
- _top: Open in top frame

**Example with target**:
\`\`\`html
<a href="https://example.com" target="_blank" rel="noopener">External link</a>
\`\`\`

**rel attribute** (relationship):
- noopener: Prevent window.opener access
- noreferrer: Don't send referrer information
- nofollow: Tell search engines not to follow
- opener, author, help, license, etc.

**title attribute** (tooltip):
\`\`\`html
<a href="/products" title="View our products">Products</a>
\`\`\`

**Link best practices**:
- Use descriptive link text (avoid "click here")
- Use internal links for site navigation
- Make links visible (different color/underline)
- Use rel="noopener" for external links in new tabs
- Ensure keyboard accessibility
- Include title for additional context

**Accessibility**:
- Descriptive link text for screen readers
- Include aria-label if text unclear
- Ensure sufficient color contrast
- Make links keyboard-accessible`,
    aiSummary: '<a> tags create hyperlinks with href attribute. Use rel="noopener" for external links, descriptive text for accessibility, and proper attributes for navigation control.'
  },
  'Absolute vs. Relative URLs': {
    content: `Understanding URL types is crucial for linking:

**Absolute URLs**:
- Complete URL with protocol and domain
- Example: https://www.example.com/about
- Same regardless of current page location
- Used for external links
- Includes scheme (http/https), domain, path

**Structure**:
\`\`\`
https://www.example.com:8080/path/to/page.html?query=value#section
│       │                    │                     │           │
scheme  domain              path                query          hash
\`\`\`

**Relative URLs**:
- Path relative to current page location
- Examples:
  - "./page.html" (same directory)
  - "../about.html" (parent directory)
  - "/about" (from root)
  - "images/photo.jpg" (subdirectory)

**Document root relative** (starts with /):
- Relative to domain root
- Works from any page location
- Recommended for site-wide consistency

**Directory relative** (no leading /):
- Relative to current file
- Changes meaning based on current page
- Risky for site structure changes

**Examples**:
\`\`\`html
<!-- Absolute -->
<a href="https://example.com/about">About</a>

<!-- Root relative -->
<a href="/about">About</a>

<!-- Directory relative -->
<a href="about.html">About</a>
<a href="../index.html">Home</a>
\`\`\`

**Best practices**:
- Use root-relative URLs for internal links
- Use absolute for external links
- Avoid directory-relative URLs
- Test links when moving pages
- Use consistent URL structure`,
    aiSummary: 'Absolute URLs include protocol and domain (https://example.com/page), relative URLs depend on current location. Use root-relative URLs (/about) for internal links and absolute for external.'
  },
  'Target Attribute and Linking to Different Sections': {
    content: `Control link behavior and navigate within pages:

**Target attribute values**:
- **_self**: Load in same tab (default)
- **_blank**: Load in new tab/window
- **_parent**: Load in parent frame
- **_top**: Load in top frame (escape frames)

**Example**:
\`\`\`html
<!-- Same tab -->
<a href="page.html">Link</a>

<!-- New tab -->
<a href="page.html" target="_blank">External</a>

<!-- New tab with security -->
<a href="https://external.com" target="_blank" rel="noopener">Safe external</a>
\`\`\`

**Anchors and named sections**:
- Create targets with id attribute
- Link to them with # in href
- Example:
\`\`\`html
<h2 id="features">Features</h2>

<a href="#features">Jump to Features</a>
\`\`\`

**Page-to-page anchors**:
\`\`\`html
<!-- Link to section on another page -->
<a href="about.html#team">See Team Section</a>
\`\`\`

**Table of contents example**:
\`\`\`html
<nav>
    <ul>
        <li><a href="#intro">Introduction</a></li>
        <li><a href="#methods">Methods</a></li>
        <li><a href="#results">Results</a></li>
    </ul>
</nav>

<section id="intro"><h2>Introduction</h2>...</section>
<section id="methods"><h2>Methods</h2>...</section>
<section id="results"><h2>Results</h2>...</section>
\`\`\`

**Accessibility considerations**:
- Use meaningful anchor text
- Ensure anchors are keyboard accessible
- Don't use anchors without visual indication
- Test navigation with screen readers

**Best practices**:
- Use rel="noopener noreferrer" for external _blank links
- Provide context for new window links
- Use anchors for long documents
- Test all links regularly`,
    aiSummary: 'Target attribute controls where links open (_blank for new tab, _self for same tab). Create section links using id attributes and href="#section-id" for on-page navigation.'
  },
  'Anchor Links and Bookmarking': {
    content: `Anchor links enable navigation within and across pages:

**Creating bookmarks with id**:
\`\`\`html
<h2 id="chapter-1">Chapter 1</h2>
<h2 id="chapter-2">Chapter 2</h2>
<h2 id="chapter-3">Chapter 3</h2>
\`\`\`

**Linking to bookmarks**:
\`\`\`html
<!-- Jump to section on same page -->
<a href="#chapter-2">Go to Chapter 2</a>

<!-- Jump to section on different page -->
<a href="book.html#chapter-2">Chapter 2 of Book</a>

<!-- From another site -->
<a href="https://example.com/page#section">External section</a>
\`\`\`

**"Back to top" link**:
\`\`\`html
<footer>
    <a href="#main">Back to Top</a>
</footer>
\`\`\`

**Table of contents for large documents**:
\`\`\`html
<nav>
    <h2>Contents</h2>
    <ol>
        <li><a href="#intro">Introduction</a></li>
        <li><a href="#chapter-1">Chapter 1</a></li>
        <li><a href="#chapter-2">Chapter 2</a></li>
    </ol>
</nav>

<section id="intro"><h2>Introduction</h2>...</section>
<section id="chapter-1"><h2>Chapter 1</h2>...</section>
<section id="chapter-2"><h2>Chapter 2</h2>...</section>
\`\`\`

**Important notes**:
- id attribute must be unique on page
- URL in address bar updates with fragment (#section)
- User can bookmark the state
- Browser remembers scroll position
- Screen readers can navigate to anchors

**Accessibility**:
- Use semantic headings as bookmarks
- Ensure anchor destination is clearly marked
- Test keyboard navigation to anchors
- Use descriptive anchor text

**Best practices**:
- Use meaningful, descriptive ids
- Use lowercase, hyphens for multi-word ids
- Make anchor destinations visually obvious
- Provide navigation aids for long documents`,
    aiSummary: 'Anchor links use id attribute to create bookmarks and href="#id" to link to them. Enable navigation within pages and across pages. Browser address bar shows fragment (#section).'
  },
  'Creating Tables with <table>, <tr>, <td>, <th>': {
    content: `Tables organize data in rows and columns:

**Basic table structure**:
\`\`\`html
<table>
    <tr>
        <th>Name</th>
        <th>Age</th>
        <th>City</th>
    </tr>
    <tr>
        <td>John</td>
        <td>25</td>
        <td>New York</td>
    </tr>
    <tr>
        <td>Jane</td>
        <td>30</td>
        <td>Los Angeles</td>
    </tr>
</table>
\`\`\`

**Table elements**:
- **<table>**: Container for entire table
- **<tr>**: Table row
- **<th>**: Table header cell (bold, centered)
- **<td>**: Table data cell

**Semantic table structure**:
\`\`\`html
<table>
    <thead>
        <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Widget A</td>
            <td>$10</td>
            <td>5</td>
        </tr>
        <tr>
            <td>Widget B</td>
            <td>$15</td>
            <td>3</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <th>Total</th>
            <td colspan="2">8 items</td>
        </tr>
    </tfoot>
</table>
\`\`\`

**Best practices**:
- Use <thead>, <tbody>, <tfoot> for semantics
- Use <th> for headers, not <td>
- Provide table caption with <caption>
- Add summary attribute on table
- Use scope="row" or scope="col" on headers
- Keep tables simple and focused
- Avoid nesting tables when possible

**Accessibility**:
- Add scope attribute to headers
- Use caption and summary
- Simple structure for screen readers
- Proper header-cell association`,
    aiSummary: 'Tables use <table>, <tr>, <th>, <td> elements with semantic <thead>, <tbody>, <tfoot> sections. Use scope attribute on headers for accessibility and captions for understanding.'
  },
  'Merging Rows and Columns (rowspan, colspan)': {
    content: `Expand cells across multiple rows and columns:

**colspan attribute** (merge columns):
\`\`\`html
<table border="1">
    <tr>
        <th>Name</th>
        <th colspan="2">Contact Info</th>
    </tr>
    <tr>
        <td>John</td>
        <td>john@example.com</td>
        <td>555-1234</td>
    </tr>
</table>
\`\`\`

**rowspan attribute** (merge rows):
\`\`\`html
<table border="1">
    <tr>
        <th>Name</th>
        <th>Details</th>
    </tr>
    <tr>
        <td rowspan="2">John</td>
        <td>Age: 25</td>
    </tr>
    <tr>
        <td>City: NYC</td>
    </tr>
</table>
\`\`\`

**Combined rowspan and colspan**:
\`\`\`html
<table border="1">
    <tr>
        <th colspan="2" rowspan="2">Info</th>
        <th>Q1</th>
        <th>Q2</th>
    </tr>
    <tr>
        <td>10</td>
        <td>20</td>
    </tr>
    <tr>
        <td>Region</td>
        <td>City</td>
        <td>30</td>
        <td>40</td>
    </tr>
</table>
\`\`\`

**Important notes**:
- colspan/rowspan values must be integers
- Don't create accessibility issues
- Can make tables complex
- Affects cell counting in rows
- Need careful planning for layout

**Accessibility considerations**:
- Keep tables simple when possible
- Use scope attribute with merged cells
- Test with screen readers
- Provide alternate format for complex tables
- Ensure logical reading order

**Best practices**:
- Use rowspan/colspan sparingly
- Keep tables simple and understandable
- Test with accessibility tools
- Consider alternative layouts for complex data
- Document table structure clearly`,
    aiSummary: 'colspan merges columns, rowspan merges rows. Combine both for complex layouts. Use sparingly to maintain accessibility and readability.'
  },
  'Styling Tables with CSS': {
    content: `CSS transforms basic HTML tables into attractive data displays:

**Basic table styling**:
\`\`\`css
table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-family: Arial, sans-serif;
}

th, td {
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
}

th {
    background-color: #4CAF50;
    color: white;
    font-weight: bold;
}

tr:hover {
    background-color: #f5f5f5;
}
\`\`\`

**Striped rows**:
\`\`\`css
tbody tr:nth-child(odd) {
    background-color: #f9f9f9;
}
\`\`\`

**Responsive tables**:
\`\`\`css
@media (max-width: 768px) {
    table, thead, tbody, th, td, tr {
        display: block;
    }
    
    tr {
        margin-bottom: 15px;
    }
    
    td::before {
        content: attr(data-label);
        font-weight: bold;
        margin-right: 10px;
    }
}
\`\`\`

**Modern table design**:
\`\`\`css
table {
    border-collapse: collapse;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

tbody tr:hover {
    background-color: #f0f0f0;
    cursor: pointer;
}
\`\`\`

**Key CSS properties**:
- **border-collapse**: Merge cell borders
- **padding**: Cell content spacing
- **text-align**: Cell text alignment
- **background**: Row/column colors
- **nth-child()**: Stripe rows
- **hover**: Interactive effects

**Best practices**:
- Keep table styling consistent
- Ensure readability with good contrast
- Use hover effects for interactivity
- Make responsive for mobile
- Don't make tables too wide
- Test across browsers`,
    aiSummary: 'CSS styling improves table appearance with borders, padding, colors, and hover effects. Border-collapse unifies borders, nth-child() creates striped rows, media queries enable responsiveness.'
  },
  'Nested Tables and Accessibility Features': {
    content: `Table nesting and accessibility best practices:

**Nested tables** (avoid when possible):
\`\`\`html
<table>
    <tr>
        <td>
            <table>
                <tr><td>Nested cell</td></tr>
            </table>
        </td>
    </tr>
</table>
\`\`\`

**Cons of nested tables**:
- Complex for screen readers
- Difficult to maintain
- Poor accessibility
- Increases code complexity
- Slower to render

**Better alternatives**:
- Use CSS for layout instead
- Use divs and flexbox
- Use CSS Grid
- Flatten table structure

**Accessibility features**:

**1. Caption**:
\`\`\`html
<table>
    <caption>Sales Data 2024</caption>
    <!-- table content -->
</table>
\`\`\`

**2. Summary attribute** (deprecated, use caption):
\`\`\`html
<table summary="Quarterly sales figures">
</table>
\`\`\`

**3. Scope attribute** (critical):
\`\`\`html
<table>
    <tr>
        <th scope="col">Name</th>
        <th scope="col">Age</th>
    </tr>
    <tr>
        <th scope="row">John</th>
        <td>25</td>
    </tr>
</table>
\`\`\`

**4. thead, tbody, tfoot**:
\`\`\`html
<table>
    <thead>
        <tr><th>Header</th></tr>
    </thead>
    <tbody>
        <tr><td>Data</td></tr>
    </tbody>
</table>
\`\`\`

**5. ID and headers attributes** (complex tables):
\`\`\`html
<table>
    <tr>
        <th id="h1">Name</th>
        <th id="h2">Age</th>
    </tr>
    <tr>
        <td headers="h1">John</td>
        <td headers="h2">25</td>
    </tr>
</table>
\`\`\`

**Best practices**:
- Avoid nested tables completely
- Always use scope on headers
- Provide captions and summaries
- Use semantic structure (thead/tbody)
- Test with screen readers
- Keep tables simple
- Use id/headers for complex tables`,
    aiSummary: 'Avoid nesting tables. Ensure accessibility with scope attribute on headers, caption for tables, and semantic structure. Test with screen readers for proper interpretation.'
  },
  'Creating Forms (<form>) and Form Attributes': {
    content: `Forms collect user input:

**Basic form structure**:
\`\`\`html
<form action="/submit" method="POST">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    
    <button type="submit">Submit</button>
</form>
\`\`\`

**<form> attributes**:
- **action**: URL to submit form data
- **method**: HTTP method (GET or POST)
- **enctype**: Encoding type (multipart/form-data for files)
- **accept-charset**: Character encoding
- **novalidate**: Skip browser validation
- **autocomplete**: "on" or "off"
- **target**: Where to open response

**Method comparison**:
- **GET**: Data in URL, visible, limited size, bookmarkable
- **POST**: Data in body, hidden, unlimited size, not bookmarkable

**Common attributes example**:
\`\`\`html
<form action="/user/register" 
      method="POST" 
      enctype="multipart/form-data"
      autocomplete="on">
    <!-- form fields -->
</form>
\`\`\`

**Important notes**:
- Every input needs name attribute for submission
- Match label "for" with input "id"
- Use appropriate input types
- Set method="POST" for sensitive data
- Set enctype="multipart/form-data" for file uploads

**Form submission flow**:
1. User fills in fields
2. User clicks submit button
3. Browser validates (if enabled)
4. Form data sent to action URL
5. Server processes and responds

**Best practices**:
- Always use labels
- Provide clear instructions
- Validate on both client and server
- Use appropriate input types
- Provide helpful error messages`,
    aiSummary: 'Forms use <form> with action URL and method (GET/POST). Include required attributes: action, method. POST for sensitive data, GET for simple queries. Every input needs name attribute.'
  },
  'Input Fields (<input>), Textareas, Radio Buttons, Checkboxes': {
    content: `Various input types for different data:

**Text input**:
\`\`\`html
<input type="text" name="username" placeholder="Enter username">
\`\`\`

**Email, password, number**:
\`\`\`html
<input type="email" name="email" required>
<input type="password" name="pass">
<input type="number" name="age" min="0" max="120">
\`\`\`

**Textarea** (multi-line text):
\`\`\`html
<textarea name="comments" rows="5" cols="40">Default text</textarea>
\`\`\`

**Radio buttons** (one selection):
\`\`\`html
<label><input type="radio" name="size" value="small"> Small</label>
<label><input type="radio" name="size" value="medium"> Medium</label>
<label><input type="radio" name="size" value="large"> Large</label>
\`\`\`

**Checkboxes** (multiple selections):
\`\`\`html
<label><input type="checkbox" name="interests" value="sports"> Sports</label>
<label><input type="checkbox" name="interests" value="music"> Music</label>
<label><input type="checkbox" name="interests" value="reading"> Reading</label>
\`\`\`

**Common input types**:
- text, email, password, number, tel, url
- date, time, datetime-local, month, week
- color, range, search, file
- hidden, button, submit, reset, checkbox, radio

**Input attributes**:
- **placeholder**: Hint text
- **required**: Must fill
- **disabled**: Grayed out, not submitted
- **readonly**: Can't modify
- **value**: Default value
- **maxlength**: Max characters
- **min/max**: Range for numbers
- **pattern**: Regex validation

**Example with attributes**:
\`\`\`html
<input type="text" 
       name="phone" 
       placeholder="(123) 456-7890"
       pattern="[0-9\\-()\\s]+"
       maxlength="15"
       required>
\`\`\`

**Best practices**:
- Always use labels
- Provide helpful placeholders
- Use appropriate input types
- Set required attribute
- Validate with pattern
- Test across browsers`,
    aiSummary: 'Input types include text, email, password, number, date, radio, checkbox. Textarea for multi-line. Use attributes like required, placeholder, pattern for validation and user guidance.'
  },
  'Dropdowns (<select>), Date Pickers, and File Uploads': {
    content: `Advanced form input elements:

**Dropdowns (<select>)**:
\`\`\`html
<label for="country">Country:</label>
<select id="country" name="country" required>
    <option value="">-- Select --</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
</select>
\`\`\`

**Grouped select**:
\`\`\`html
<select name="product">
    <optgroup label="Electronics">
        <option>Laptop</option>
        <option>Phone</option>
    </optgroup>
    <optgroup label="Accessories">
        <option>Case</option>
        <option>Charger</option>
    </optgroup>
</select>
\`\`\`

**Multiple select**:
\`\`\`html
<select name="courses" multiple size="4">
    <option>HTML</option>
    <option>CSS</option>
    <option>JavaScript</option>
    <option>Python</option>
</select>
\`\`\`

**Date picker**:
\`\`\`html
<input type="date" name="birthdate" min="1900-01-01" max="2006-12-31">
<input type="time" name="appointment">
<input type="month" name="month">
<input type="week" name="week">
\`\`\`

**File upload**:
\`\`\`html
<input type="file" name="avatar" accept="image/*" required>
\`\`\`

**Multiple files**:
\`\`\`html
<input type="file" name="documents" multiple accept=".pdf,.doc,.docx">
\`\`\`

**File input attributes**:
- **accept**: Allowed file types (.pdf, image/*, video/*)
- **multiple**: Allow multiple files
- **capture**: Use device camera/mic
- **disabled**, **required**

**Range input** (slider):
\`\`\`html
<input type="range" name="volume" min="0" max="100" value="50">
\`\`\`

**Color picker**:
\`\`\`html
<input type="color" name="favorite_color" value="#ff0000">
\`\`\`

**Best practices**:
- Provide default values
- Use date pickers for dates
- Set accept attribute for file uploads
- Validate file types on server
- Provide clear upload feedback
- Test file upload size limits`,
    aiSummary: 'Select dropdowns for choices, input type="date/time/month/week" for dates, input type="file" for uploads. Use multiple attribute for multi-select, accept for file types.'
  },
  'Form Validation and HTML5 Attributes': {
    content: `Built-in form validation without JavaScript:

**HTML5 validation attributes**:
- **required**: Field must be filled
- **type**: Email, number, URL validation
- **pattern**: Regex for custom validation
- **min/max**: Range for numbers/dates
- **minlength/maxlength**: Text length
- **step**: Increment steps for numbers

**Required field**:
\`\`\`html
<input type="text" name="username" required>
\`\`\`

**Email validation**:
\`\`\`html
<input type="email" name="email" required>
\`\`\`

**Number range**:
\`\`\`html
<input type="number" name="age" min="18" max="100" required>
\`\`\`

**Text length**:
\`\`\`html
<input type="password" name="pass" minlength="8" maxlength="20" required>
\`\`\`

**Pattern validation** (regex):
\`\`\`html
<!-- Phone number -->
<input type="tel" name="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required>

<!-- Username: 3-20 alphanumeric -->
<input type="text" name="username" pattern="[a-zA-Z0-9]{3,20}" required>
\`\`\`

**URL validation**:
\`\`\`html
<input type="url" name="website" required>
\`\`\`

**Date validation**:
\`\`\`html
<input type="date" name="birthdate" min="1900-01-01" max="2010-12-31">
\`\`\`

**Custom validation example**:
\`\`\`html
<form>
    <input type="email" name="email" required>
    <input type="text" name="username" pattern="[a-z0-9_]{3,20}" required>
    <input type="password" name="password" minlength="8" required>
    <input type="number" name="age" min="18" max="120">
    <button type="submit">Register</button>
</form>
\`\`\`

**Browser feedback**:
- Invalid field gets :invalid CSS pseudo-class
- Valid field gets :valid pseudo-class
- Error messages provided by browser

**Styling validation**:
\`\`\`css
input:valid {
    border: 2px solid green;
}

input:invalid {
    border: 2px solid red;
}
\`\`\`

**Best practices**:
- Always validate server-side too
- Provide clear error messages
- Use appropriate input types
- Test validation across browsers
- Don't disable HTML5 validation
- Combine HTML5 with JavaScript for complex validation`,
    aiSummary: 'HTML5 attributes (required, type, pattern, min, max, minlength) provide built-in form validation. Browsers provide error messages. Always validate server-side for security.'
  },
  'Using <label> and <fieldset> for Better Accessibility': {
    content: `Improve form accessibility and usability:

**<label> element** (crucial):
\`\`\`html
<!-- Implicit association (text inside label) -->
<label>
    <input type="checkbox" name="agree"> I agree to terms
</label>

<!-- Explicit association (recommended) -->
<label for="email">Email Address:</label>
<input type="email" id="email" name="email">
\`\`\`

**Why labels matter**:
- Screen readers read label text
- Clicking label focuses/toggles input
- Larger click area for checkboxes/radios
- Visual association for sighted users
- Improves usability on mobile

**<fieldset> and <legend>**:
Groups related form fields:
\`\`\`html
<fieldset>
    <legend>Shipping Address</legend>
    
    <label for="street">Street:</label>
    <input type="text" id="street" name="street">
    
    <label for="city">City:</label>
    <input type="text" id="city" name="city">
    
    <label for="zip">ZIP Code:</label>
    <input type="text" id="zip" name="zip">
</fieldset>

<fieldset>
    <legend>Billing Address</legend>
    <!-- billing fields -->
</fieldset>
\`\`\`

**Large form example**:
\`\`\`html
<form>
    <fieldset>
        <legend>Personal Information</legend>
        <label for="fname">First Name:</label>
        <input type="text" id="fname" name="fname" required>
        
        <label for="lname">Last Name:</label>
        <input type="text" id="lname" name="lname" required>
    </fieldset>
    
    <fieldset>
        <legend>Contact Details</legend>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        
        <label for="phone">Phone:</label>
        <input type="tel" id="phone" name="phone">
    </fieldset>
    
    <button type="submit">Submit</button>
</form>
\`\`\`

**Styling labels and fieldsets**:
\`\`\`css
label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

fieldset {
    border: 1px solid #ccc;
    padding: 15px;
    margin: 15px 0;
}

legend {
    padding: 0 10px;
    font-weight: bold;
}
\`\`\`

**Best practices**:
- Always use labels with for attribute
- Group related fields with fieldset
- Use legend to describe fieldset
- Make label clickable area large
- Test with screen readers
- Don't hide labels only with placeholder`,
    aiSummary: 'Use <label for="id"> with matching input id for accessibility. Use <fieldset> with <legend> to group related fields. Improves screen reader support and mobile usability.'
  },
  'Introduction to HTML5': {
    content: `HTML5 brings modern web capabilities:

**Major improvements over HTML4**:
- Semantic elements for better meaning
- Native multimedia without plugins
- Canvas for graphics
- Enhanced form controls
- Offline capabilities
- Geolocation API
- Local storage
- Better accessibility support

**Why HTML5 matters**:
- No Flash or plugins needed
- Better search engine optimization
- Improved mobile support
- Enhanced performance
- Standardized APIs
- Better accessibility
- Device integration

**Key features**:

**1. Semantic elements**:
\`\`\`html
<header>, <nav>, <main>, <article>, 
<section>, <aside>, <footer>
\`\`\`

**2. Native audio/video**:
\`\`\`html
<video controls>
    <source src="movie.mp4">
</video>

<audio controls>
    <source src="audio.mp3">
</audio>
\`\`\`

**3. Canvas for graphics**:
\`\`\`html
<canvas id="myCanvas" width="200" height="100"></canvas>
<script>
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(10, 10, 50, 50);
</script>
\`\`\`

**4. Enhanced form controls**:
- Email, number, date, color inputs
- Range and search inputs
- Built-in validation

**5. APIs**:
- Geolocation: User location
- LocalStorage: Client-side storage
- SessionStorage: Temporary storage
- IndexedDB: Database in browser

**Backward compatibility**:
- HTML5 works in older browsers
- Graceful degradation
- Progressive enhancement

**Current status**:
- HTML5 is "living standard"
- Continuously updated
- WHATWG maintains spec
- Browser support excellent`,
    aiSummary: 'HTML5 introduced semantic elements, native multimedia, Canvas, improved forms, and APIs like Geolocation and LocalStorage. Modern standard with excellent browser support.'
  },
  'New Semantic Elements (<article>, <section>, <aside>, <nav>)': {
    content: `Semantic HTML5 elements improve meaning and accessibility:

**<article> element**:
- Self-contained, independent content
- Blog post, news article, comment
- Can be reused anywhere
- Example:
\`\`\`html
<article>
    <h2>Blog Post Title</h2>
    <p>Written by John Doe on March 15, 2024</p>
    <p>Article content here...</p>
</article>
\`\`\`

**<section> element**:
- Thematic grouping of content
- Related content together
- Not for styling purposes
- Example:
\`\`\`html
<section>
    <h2>Features</h2>
    <p>Feature 1: ...</p>
    <p>Feature 2: ...</p>
</section>
\`\`\`

**<aside> element**:
- Sidebar or tangential content
- Related but not main content
- Quotes, author info, related links
- Example:
\`\`\`html
<aside>
    <h3>Related Articles</h3>
    <ul>
        <li><a href="#">Article 1</a></li>
        <li><a href="#">Article 2</a></li>
    </ul>
</aside>
\`\`\`

**<nav> element**:
- Navigation links
- Main menu, breadcrumbs, pagination
- Example:
\`\`\`html
<nav>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
    </ul>
</nav>
\`\`\`

**Other semantic elements**:
- <header>: Introductory content, logo, navigation
- <footer>: Closing content, copyright, links
- <main>: Primary page content
- <figure>/<figcaption>: Images with captions
- <time>: Specific time/date

**Complete page structure**:
\`\`\`html
<body>
    <header>
        <h1>Site Title</h1>
        <nav><!-- Navigation --></nav>
    </header>
    
    <main>
        <article>
            <h2>Article Title</h2>
            <p>Content...</p>
        </article>
        
        <section>
            <h2>Related</h2>
            <p>Info...</p>
        </section>
    </main>
    
    <aside>
        <h3>Sidebar</h3>
        <p>Additional info...</p>
    </aside>
    
    <footer>
        <p>Copyright 2024</p>
    </footer>
</body>
\`\`\`

**Benefits**:
- Better accessibility for screen readers
- Improved SEO
- Clearer document structure
- Easier to maintain
- Better mobile representation

**Best practices**:
- Use semantic elements appropriately
- Don't confuse section and article
- Maintain proper heading hierarchy
- Test with screen readers`,
    aiSummary: '<article> for independent content, <section> for thematic grouping, <aside> for tangential content, <nav> for navigation. Improves accessibility, SEO, and document structure.'
  },
  'Canvas API (<canvas>) for Graphics and Animations': {
    content: `Create graphics and animations with Canvas:

**Basic canvas element**:
\`\`\`html
<canvas id="myCanvas" width="400" height="300"></canvas>
\`\`\`

**Drawing with JavaScript**:
\`\`\`javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Draw rectangle
ctx.fillStyle = 'blue';
ctx.fillRect(10, 10, 100, 50);

// Draw circle
ctx.fillStyle = 'red';
ctx.beginPath();
ctx.arc(200, 150, 50, 0, 2 * Math.PI);
ctx.fill();

// Draw line
ctx.strokeStyle = 'black';
ctx.beginPath();
ctx.moveTo(10, 10);
ctx.lineTo(200, 200);
ctx.stroke();
\`\`\`

**Canvas shapes**:
- Rectangles: fillRect(), strokeRect()
- Circles/arcs: arc(), arcTo()
- Lines: moveTo(), lineTo(), stroke()
- Paths: beginPath(), closePath()
- Text: fillText(), strokeText()

**Animations**:
\`\`\`javascript
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw updated content
    requestAnimationFrame(animate);
}
animate();
\`\`\`

**Drawing styles**:
- **fillStyle**: Fill color
- **strokeStyle**: Line color
- **lineWidth**: Line thickness
- **font**: Text font
- **globalAlpha**: Transparency

**Example: Animated Rectangle**:
\`\`\`javascript
let x = 0;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(x, 50, 50, 50);
    x += 2;
    if (x > canvas.width) x = 0;
    requestAnimationFrame(animate);
}
animate();
\`\`\`

**Canvas vs SVG**:
- Canvas: Raster graphics, pixel-based
- SVG: Vector graphics, scalable

**Use cases**:
- Charts and graphs
- Games
- Animations
- Drawing applications
- Image manipulation

**Performance considerations**:
- Clear canvas before drawing
- Use offscreen canvas for complex graphics
- Optimize draw calls
- Use requestAnimationFrame
- Limit animation frame rate

**Best practices**:
- Provide fallback content
- Test browser compatibility
- Optimize for performance
- Consider accessibility`,
    aiSummary: 'Canvas element allows drawing and animations with JavaScript 2D context. Use methods like fillRect, arc, stroke, and requestAnimationFrame for smooth animations.'
  },
  'SVG (Scalable Vector Graphics) in HTML': {
    content: `Scalable vector graphics for responsive images:

**Inline SVG**:
\`\`\`html
<svg width="100" height="100">
    <circle cx="50" cy="50" r="40" fill="blue" />
    <rect x="10" y="10" width="30" height="30" fill="red" />
    <line x1="0" y1="0" x2="100" y2="100" stroke="black" />
</svg>
\`\`\`

**SVG as image**:
\`\`\`html
<img src="image.svg" alt="Scalable image">
\`\`\`

**SVG as background**:
\`\`\`css
div {
    background-image: url('image.svg');
}
\`\`\`

**SVG as object**:
\`\`\`html
<object data="image.svg" type="image/svg+xml"></object>
\`\`\`

**Basic SVG elements**:
- <circle>: cx, cy (center), r (radius)
- <rect>: x, y, width, height
- <line>: x1, y1, x2, y2
- <polyline>: points connected
- <polygon>: closed shape
- <ellipse>: cx, cy, rx, ry
- <path>: Complex shapes with d attribute
- <text>: Text content

**Complete SVG example**:
\`\`\`html
<svg width="200" height="200" viewBox="0 0 200 200">
    <!-- Background -->
    <rect width="200" height="200" fill="white"/>
    
    <!-- Circle -->
    <circle cx="100" cy="100" r="80" fill="blue" stroke="black" stroke-width="2"/>
    
    <!-- Text -->
    <text x="100" y="110" text-anchor="middle" fill="white">SVG</text>
</svg>
\`\`\`

**SVG attributes**:
- **fill**: Fill color
- **stroke**: Outline color
- **stroke-width**: Line thickness
- **opacity**: Transparency
- **transform**: Rotate, scale, translate

**SVG animation** (with SMIL):
\`\`\`html
<svg>
    <circle cx="50" cy="50" r="40" fill="blue">
        <animate attributeName="cx" from="50" to="150" dur="2s" repeatCount="indefinite"/>
    </circle>
</svg>
\`\`\`

**Advantages**:
- Scalable without quality loss
- Smaller file size than PNG
- Can interact with CSS/JavaScript
- Accessible (text searchable)
- Resolution-independent

**Use cases**:
- Icons
- Logos
- Illustrations
- Interactive graphics
- Responsive images

**Best practices**:
- Optimize SVG files
- Use viewBox for responsiveness
- Test browser compatibility
- Provide fallbacks
- Consider performance for complex graphics`,
    aiSummary: 'SVG provides scalable vector graphics with elements like circle, rect, path. Embed inline or as image. Smaller, resolution-independent, and interactive unlike raster graphics.'
  },
  'Data Attributes and Custom Attributes': {
    content: `Store custom data in HTML elements:

**data- attributes** (data-* convention):
\`\`\`html
<div id="user" 
     data-user-id="12345"
     data-username="johndoe"
     data-role="admin">
    User Profile
</div>
\`\`\`

**Accessing with JavaScript**:
\`\`\`javascript
const element = document.getElementById('user');
console.log(element.dataset.userId);      // "12345"
console.log(element.dataset.username);    // "johndoe"
console.log(element.dataset.role);        // "admin"

// Modify data attribute
element.dataset.role = "moderator";
\`\`\`

**Multiple attributes**:
\`\`\`html
<div data-product-id="789"
     data-product-name="Widget"
     data-product-price="29.99"
     data-in-stock="true">
    Product Details
</div>
\`\`\`

**Common use cases**:

**1. Store IDs for JavaScript**:
\`\`\`html
<button data-action="delete" data-item-id="42">Delete</button>

<script>
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.itemId;
            deleteItem(id);
        });
    });
</script>
\`\`\`

**2. Styling with CSS selectors**:
\`\`\`css
[data-status="active"] {
    color: green;
}

[data-status="inactive"] {
    color: gray;
}
\`\`\`

**3. Templates and configuration**:
\`\`\`html
<div id="chart" 
     data-chart-type="bar"
     data-chart-width="400"
     data-chart-height="300">
</div>

<script>
    const config = {
        type: element.dataset.chartType,
        width: element.dataset.chartWidth,
        height: element.dataset.chartHeight
    };
</script>
\`\`\`

**Important notes**:
- Must start with "data-"
- After "data-", lowercase with hyphens
- JavaScript converts hyphens to camelCase
- Visible in page source (not sensitive data)
- Data is strings, convert as needed

**Example: Data-driven functionality**:
\`\`\`html
<div class="card" data-card-id="1" data-favorite="false">
    <h3>Card Title</h3>
    <button data-action="favorite">❤</button>
</div>

<script>
    document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.card');
            card.dataset.favorite = card.dataset.favorite === 'true' ? 'false' : 'true';
            this.textContent = card.dataset.favorite === 'true' ? '❤️' : '🤍';
        });
    });
</script>
\`\`\`

**Best practices**:
- Use data attributes for JavaScript config
- Don't store sensitive information
- Use semantic HTML first
- Keep data attributes simple
- Document custom attributes
- Validate data on server side`,
    aiSummary: 'data-* attributes store custom data in HTML elements. Access with element.dataset.attributeName (camelCased). Useful for JavaScript functionality and CSS selectors.'
  }
};

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB Connected\n');

    let updatedCount = 0;
    let totalCount = 0;

    for (const [topicTitle, topicData] of Object.entries(TOPIC_CONTENT)) {
      totalCount++;
      process.stdout.write(`\rProcessing ${totalCount}/${Object.keys(TOPIC_CONTENT).length} topics...`);

      // Update TopicLibrary
      const libraryUpdate = await TopicLibrary.findOneAndUpdate(
        { title: topicTitle },
        {
          $set: {
            content: topicData.content,
            aiSummary: topicData.aiSummary
          }
        },
        { new: true }
      );

      if (libraryUpdate) {
        // Update Topic entries with same title
        await Topic.updateMany(
          { title: topicTitle },
          {
            $set: {
              content: topicData.content
            }
          }
        );
        updatedCount++;
      }
    }

    console.log(`\n\n✅ Content Generation Complete!\n`);
    console.log(`📝 Topics updated: ${updatedCount}`);
    console.log(`📚 Total topics processed: ${totalCount}`);
    console.log(`📄 All topics now have:`);
    console.log(`   - Full content/lessons`);
    console.log(`   - AI summaries`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
