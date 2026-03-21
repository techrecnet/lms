import React, { useEffect } from 'react'
import { Box, Stack, Typography, useTheme } from '@mui/material'
import { parseContentForYoutube, removeYoutubeLinks } from '../utils/youtubeUtils'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

type Props = {
  content: string
}

export default function ContentRenderer({ content }: Props) {
  const { youtubeIds } = parseContentForYoutube(content)
  const cleanedContent = removeYoutubeLinks(content)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Define colors based on current theme
  const colors = {
    text: isDark ? theme.palette.text.primary : '#333',
    textSecondary: isDark ? '#b0b0b0' : '#666',
    heading: isDark ? theme.palette.primary.light : '#000',
    link: isDark ? theme.palette.primary.light : theme.palette.primary.main,
    codeBg: isDark ? '#1e1e1e' : '#f5f5f5',
    codeText: isDark ? theme.palette.text.primary : '#111',
    codeBorder: isDark ? '#333' : '#ddd',
    inlineBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
    inlineText: isDark ? '#b0e0e0' : '#333',
    tableBg: isDark ? '#2a2a2a' : '#f9f9f9',
    tableBorder: isDark ? '#444' : '#ddd',
    horizRule: isDark ? '#444' : '#ddd'
  }

  useEffect(() => {
    // highlight any code blocks inside rendered HTML
    const blocks = Array.from(document.querySelectorAll('pre code'))
    blocks.forEach((block) => {
      try {
        hljs.highlightElement(block as HTMLElement)
      } catch (e) {
        // ignore highlighting errors
      }
    })
  }, [cleanedContent])

  return (
    <Stack spacing={3}>
      {/* Original HTML Content (with YouTube links removed) */}
      {cleanedContent && (
        <Box
          sx={{
            // CSS Containment - isolate styles from parent
            contain: 'layout style paint',
            
            // Reset all inherited styles
            all: 'initial',
            display: 'block',
            color: 'inherit',
            fontFamily: 'inherit',
            
            // Content styling
            whiteSpace: 'normal',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: colors.text,
            
            // Headings
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              all: 'initial',
              display: 'block',
              fontFamily: 'inherit',
              fontWeight: 700,
              lineHeight: 1.4,
              marginTop: '1em',
              marginBottom: '0.5em',
              color: colors.heading
            },
            '& h1': { fontSize: '2em' },
            '& h2': { fontSize: '1.5em' },
            '& h3': { fontSize: '1.3em' },
            '& h4': { fontSize: '1.1em' },
            '& h5': { fontSize: '1em' },
            '& h6': { fontSize: '0.95em' },
            
            // Paragraphs
            '& p': {
              all: 'initial',
              display: 'block',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: colors.text,
              marginBottom: '1em'
            },
            
            // Lists
            '& ul, & ol': {
              all: 'initial',
              display: 'block',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              color: colors.text,
              paddingLeft: '2em',
              marginTop: '0.5em',
              marginBottom: '1em',
              listStylePosition: 'outside'
            },
            '& ul': { listStyleType: 'disc' },
            '& ol': { listStyleType: 'decimal' },
            '& li': {
              all: 'initial',
              display: 'list-item',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              color: colors.text,
              lineHeight: 1.7,
              marginBottom: '0.5em'
            },
            
            // Links
            '& a': {
              all: 'initial',
              display: 'inline',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: colors.link,
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': { textDecoration: 'underline', opacity: 0.8 }
            },
            
            // Strong and emphasis
            '& strong, & b': {
              all: 'initial',
              display: 'inline',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 700,
              color: 'inherit'
            },
            '& em, & i': {
              all: 'initial',
              display: 'inline',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontStyle: 'italic',
              color: 'inherit'
            },
            
            // Code blocks
            '& pre': {
              all: 'initial',
              display: 'block',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
              fontSize: '0.85rem',
              backgroundColor: colors.codeBg,
              color: colors.codeText,
              padding: '12px',
              borderRadius: '6px',
              whiteSpace: 'pre',
              overflowX: 'auto',
              marginTop: '0.5em',
              marginBottom: '1em',
              border: `1px solid ${colors.codeBorder}`,
              lineHeight: 1.5
            },
            '& code': {
              all: 'initial',
              display: 'inline',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
              fontSize: '0.85em',
              backgroundColor: colors.inlineBg,
              padding: '2px 6px',
              borderRadius: '4px',
              color: colors.inlineText
            },
            '& pre code': {
              all: 'initial',
              display: 'block',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
              fontSize: '0.85rem',
              backgroundColor: 'transparent',
              padding: 0,
              borderRadius: 0,
              color: colors.codeText,
              whiteSpace: 'pre',
              overflowX: 'auto',
              lineHeight: 1.5
            },
            
            // Blockquote
            '& blockquote': {
              all: 'initial',
              display: 'block',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              color: colors.textSecondary,
              lineHeight: 1.7,
              borderLeft: `4px solid ${colors.link}`,
              paddingLeft: '1em',
              marginLeft: 0,
              marginTop: '0.5em',
              marginBottom: '1em',
              marginRight: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 0,
              fontStyle: 'italic'
            },
            
            // Table
            '& table': {
              all: 'initial',
              display: 'table',
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              color: colors.text,
              marginTop: '0.5em',
              marginBottom: '1em'
            },
            '& thead': {
              all: 'initial',
              display: 'table-header-group'
            },
            '& tbody': {
              all: 'initial',
              display: 'table-row-group'
            },
            '& tr': {
              all: 'initial',
              display: 'table-row'
            },
            '& th, & td': {
              all: 'initial',
              display: 'table-cell',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: 'inherit',
              border: `1px solid ${colors.tableBorder}`,
              padding: '8px 12px',
              textAlign: 'left'
            },
            '& th': {
              backgroundColor: colors.tableBg,
              fontWeight: 700,
              color: colors.heading
            },
            
            // Images
            '& img': {
              all: 'initial',
              display: 'block',
              maxWidth: '100%',
              height: 'auto',
              marginTop: '0.5em',
              marginBottom: '1em'
            },
            
            // Horizontal rule
            '& hr': {
              all: 'initial',
              display: 'block',
              height: '1px',
              backgroundColor: colors.horizRule,
              border: 'none',
              marginTop: '1em',
              marginBottom: '1em'
            }
          }}
          dangerouslySetInnerHTML={{ __html: cleanedContent }}
        />
      )}

      {/* YouTube Videos */}
      {youtubeIds.length > 0 && (
        <Stack spacing={2}>
          {youtubeIds.map((videoId) => (
            <Box key={videoId}>
              {youtubeIds.length > 1 && (
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Video
                </Typography>
              )}
              <Box
                component="iframe"
                width="100%"
                height={{ xs: 250, sm: 350, md: 420 }}
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{ borderRadius: 1, border: 'none' }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
