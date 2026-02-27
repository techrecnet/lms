import { Box, Stack, Typography } from '@mui/material'
import { parseContentForYoutube, removeYoutubeLinks } from '../utils/youtubeUtils'

type Props = {
  content: string
}

export default function ContentRenderer({ content }: Props) {
  const { youtubeIds } = parseContentForYoutube(content)
  const cleanedContent = removeYoutubeLinks(content)

  return (
    <Stack spacing={3}>
      {/* Original HTML Content (with YouTube links removed) */}
      {cleanedContent && (
        <Box
          sx={{ fontSize: '0.875rem', lineHeight: 1.8, color: '#555' }}
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
