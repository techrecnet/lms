import React, { useEffect } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { parseContentForYoutube, removeYoutubeLinks } from '../utils/youtubeUtils'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

type Props = {
  content: string
}

export default function ContentRenderer({ content }: Props) {
  const { youtubeIds } = parseContentForYoutube(content)
  const cleanedContent = removeYoutubeLinks(content)

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
            whiteSpace: 'pre-wrap',
            fontSize: '0.875rem',
            lineHeight: 1.8,
            color: '#555',
            '& ul, & ol': {
              paddingLeft: 0,
              marginTop: 0,
              marginBottom: 0,
              listStylePosition: 'outside'
            },
            '& ul': {
              listStyleType: 'disc',
            },
            '& ol': {
              listStyleType: 'decimal',
            },
            '& li': {
              marginBottom: 0
            },
            '& pre': {
              backgroundColor: '#f5f5f5',
              color: '#111',
              padding: '12px',
              borderRadius: 6,
              whiteSpace: 'pre',
              overflowX: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
              fontSize: '0.85rem'
            },
            '& code': {
              backgroundColor: 'rgba(0,0,0,0.04)',
              padding: '2px 6px',
              borderRadius: 4,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace'
            },
            '& pre code': {
              backgroundColor: 'transparent',
              padding: 0
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse'
            },
            '& th, & td': {
              border: '1px solid rgba(0,0,0,0.08)',
              padding: '8px',
              textAlign: 'left'
            },
            '& ul, & ol': {
              paddingLeft: 20,
              marginTop: 6,
              marginBottom: 6
            },
            '& a': {
              color: '#1976d2'
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
