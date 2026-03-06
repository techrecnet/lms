import { useState, useRef, useEffect } from 'react'
import { Box, Paper, Typography, Stack, Grid, Tabs, Tab, Button, IconButton, Tooltip, Menu, MenuItem } from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import DownloadIcon from '@mui/icons-material/Download'

export default function HTMLPlay() {
  const [activeTab, setActiveTab] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [dividerPos, setDividerPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null)
  const [htmlCode, setHtmlCode] = useState(`<div class="container">
  <h1>Welcome to HTML Playground!</h1>
  <p>Start editing the code in the tabs to see live changes here.</p>
  <p>You can write HTML, CSS, and JavaScript separately!</p>
  <button onclick="handleClick()">Click Me!</button>
  <div id="output"></div>
</div>`)
  
  const [cssCode, setCssCode] = useState(`body {
  font-family: Arial, sans-serif;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 0;
}

h1 {
  text-align: center;
  animation: fadeIn 1s ease-in;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

button {
  background: white;
  color: #667eea;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
}

button:hover {
  background: #f0f0f0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}`)

  const [jsCode, setJsCode] = useState(`console.log('HTML Playground is ready!');

function handleClick() {
  const output = document.getElementById('output');
  output.innerHTML = '<p style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 5px;">Button clicked! JavaScript is working! 🎉</p>';
  console.log('Button clicked!');
}`)

  const [previewDocument, setPreviewDocument] = useState<string>('')

  const getCurrentCode = () => {
    switch (activeTab) {
      case 0: return htmlCode
      case 1: return cssCode
      case 2: return jsCode
      default: return htmlCode
    }
  }

  const handleCodeChange = (value: string) => {
    switch (activeTab) {
      case 0: setHtmlCode(value); break
      case 1: setCssCode(value); break
      case 2: setJsCode(value); break
    }
  }

  const getTabLabel = () => {
    switch (activeTab) {
      case 0: return 'HTML'
      case 1: return 'CSS'
      case 2: return 'JavaScript'
      default: return 'HTML'
    }
  }

  const handleRun = () => {
    const fullDocument = `<!DOCTYPE html>
<html>
<head>
  <title>HTML Playground</title>
  <style>${cssCode}</style>
</head>
<body>
${htmlCode}
<script>${jsCode}</script>
</body>
</html>`
    setPreviewDocument(fullDocument)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const newPos = ((e.clientX - rect.left) / rect.width) * 100
      if (newPos > 20 && newPos < 80) {
        setDividerPos(newPos)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`)
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const downloadHTML = () => {
    downloadFile('index.html', `<!DOCTYPE html>
<html>
<head>
  <title>HTML Playground</title>
  <style>${cssCode}</style>
</head>
<body>
${htmlCode}
<script>${jsCode}</script>
</body>
</html>`)
  }

  const downloadCSS = () => {
    downloadFile('style.css', cssCode)
  }

  const downloadJS = () => {
    downloadFile('script.js', jsCode)
  }

  const downloadZip = async () => {
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      zip.file('index.html', `<!DOCTYPE html>
<html>
<head>
  <title>HTML Playground</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${htmlCode}
<script src="script.js"></script>
</body>
</html>`)
      zip.file('style.css', cssCode)
      zip.file('script.js', jsCode)
      const blob = await zip.generateAsync({ type: 'blob' })
      const { saveAs } = await import('file-saver') as any
      saveAs(blob, 'htmlplay.zip')
    } catch (error) {
      console.error('Error creating ZIP:', error)
      alert('Please install jszip and file-saver packages')
    }
  }

  const openInNewWindow = () => {
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(previewDocument)
      newWindow.document.close()
    }
  }

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDownloadAnchorEl(event.currentTarget)
  }

  const handleDownloadClose = () => {
    setDownloadAnchorEl(null)
  }

  if (isFullscreen) {
    return (
      <Box 
        ref={containerRef}
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 9999, 
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'row',
          cursor: isDragging ? 'col-resize' : 'default'
        }}
      >
        {/* Editor Section */}
        <Box sx={{ width: `${dividerPos}%`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Paper 
            elevation={0}
            sx={{ 
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0,
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap'
              }}
            >
              <CodeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ flexGrow: 1 }}>
                {getTabLabel()} Editor
              </Typography>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={handleRun}
                sx={{ textTransform: 'none' }}
              >
                Run
              </Button>
              <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
                <IconButton size="small" onClick={toggleDarkMode} color="primary">
                  {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadClick}
                sx={{ textTransform: 'none' }}
              >
                Download
              </Button>
              <Menu
                anchorEl={downloadAnchorEl}
                open={Boolean(downloadAnchorEl)}
                onClose={handleDownloadClose}
              >
                <MenuItem onClick={() => { downloadHTML(); handleDownloadClose(); }}>Download HTML</MenuItem>
                <MenuItem onClick={() => { downloadCSS(); handleDownloadClose(); }}>Download CSS</MenuItem>
                <MenuItem onClick={() => { downloadJS(); handleDownloadClose(); }}>Download JavaScript</MenuItem>
                <MenuItem onClick={() => { downloadZip(); handleDownloadClose(); }}>Download ZIP</MenuItem>
              </Menu>
              <Tooltip title={showPreview ? "Hide Preview" : "Show Preview"}>
                <IconButton size="small" onClick={togglePreview} color="primary">
                  {showPreview ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Exit Fullscreen">
                <IconButton size="small" onClick={toggleFullscreen} color="primary">
                  <FullscreenExitIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ 
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                minHeight: 42,
                '& .MuiTab-root': {
                  minHeight: 42,
                  textTransform: 'none',
                  fontWeight: 500
                }
              }}
            >
              <Tab label="HTML" />
              <Tab label="CSS" />
              <Tab label="JavaScript" />
            </Tabs>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <textarea
                value={getCurrentCode()}
                onChange={(e) => handleCodeChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '16px',
                  fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
                  fontSize: '14px',
                  lineHeight: '1.6',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                  color: isDarkMode ? '#d4d4d4' : '#000000',
                  caretColor: isDarkMode ? '#fff' : '#000',
                }}
                spellCheck={false}
              />
            </Box>
          </Paper>
        </Box>

        {/* Divider */}
        {showPreview && (
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              width: '4px',
              backgroundColor: 'divider',
              cursor: 'col-resize',
              transition: isDragging ? 'none' : 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'primary.main',
              }
            }}
          />
        )}

        {/* Preview Section */}
        {showPreview && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Paper 
              elevation={0}
              sx={{ 
                height: '100%', 
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 0,
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <VisibilityIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ flexGrow: 1 }}>
                  Preview
                </Typography>
                <Tooltip title="Open in New Window">
                  <IconButton size="small" onClick={openInNewWindow} color="primary">
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: '#fff' }}>
                <iframe
                  srcDoc={previewDocument}
                  title="HTML Preview"
                  sandbox="allow-scripts"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>HTML Playground</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Write HTML, CSS, and JavaScript code and click Run to see the preview
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Editor Section */}
        <Grid item xs={12} md={showPreview ? 6 : 12} sx={{ height: '100%' }}>
          <Paper 
            elevation={0}
            sx={{ 
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap'
              }}
            >
              <CodeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ flexGrow: 1 }}>
                {getTabLabel()} Editor
              </Typography>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={handleRun}
                sx={{ textTransform: 'none' }}
              >
                Run
              </Button>
              <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
                <IconButton size="small" onClick={toggleDarkMode} color="primary">
                  {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadClick}
                sx={{ textTransform: 'none' }}
              >
                Download
              </Button>
              <Menu
                anchorEl={downloadAnchorEl}
                open={Boolean(downloadAnchorEl)}
                onClose={handleDownloadClose}
              >
                <MenuItem onClick={() => { downloadHTML(); handleDownloadClose(); }}>Download HTML</MenuItem>
                <MenuItem onClick={() => { downloadCSS(); handleDownloadClose(); }}>Download CSS</MenuItem>
                <MenuItem onClick={() => { downloadJS(); handleDownloadClose(); }}>Download JavaScript</MenuItem>
                <MenuItem onClick={() => { downloadZip(); handleDownloadClose(); }}>Download ZIP</MenuItem>
              </Menu>
              <Tooltip title={showPreview ? "Hide Preview" : "Show Preview"}>
                <IconButton size="small" onClick={togglePreview} color="primary">
                  {showPreview ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Fullscreen">
                <IconButton size="small" onClick={toggleFullscreen} color="primary">
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ 
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                minHeight: 42,
                '& .MuiTab-root': {
                  minHeight: 42,
                  textTransform: 'none',
                  fontWeight: 500
                }
              }}
            >
              <Tab label="HTML" />
              <Tab label="CSS" />
              <Tab label="JavaScript" />
            </Tabs>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <textarea
                value={getCurrentCode()}
                onChange={(e) => handleCodeChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '16px',
                  fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
                  fontSize: '14px',
                  lineHeight: '1.6',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                  color: isDarkMode ? '#d4d4d4' : '#000000',
                  caretColor: isDarkMode ? '#fff' : '#000',
                }}
                spellCheck={false}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Preview Section */}
        {showPreview && (
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Paper 
              elevation={0}
              sx={{ 
                height: '100%', 
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <VisibilityIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ flexGrow: 1 }}>
                  Preview
                </Typography>
                <Tooltip title="Open in New Window">
                  <IconButton size="small" onClick={openInNewWindow} color="primary">
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: '#fff' }}>
                <iframe
                  srcDoc={previewDocument}
                  title="HTML Preview"
                  sandbox="allow-scripts"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Stack>
  )
}
