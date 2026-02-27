import { Paper, Stack, Typography, Box } from '@mui/material'

export default function QuizEditorHelp() {
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">Question JSON format</Typography>
        <Typography variant="body2">Use an array of questions:</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, overflow: 'auto', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {`[{"question":"Q1","options":["A","B"],"correctAnswer":0}]`}
        </Box>
      </Stack>
    </Paper>
  )
}
