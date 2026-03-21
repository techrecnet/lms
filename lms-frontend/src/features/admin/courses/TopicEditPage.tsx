import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { Editor } from '@tinymce/tinymce-react'
import { api } from '../../../core/api'
import { ENV } from '../../../app/env'

type Topic = {
  _id: string
  title: string
  content?: string
  contentType?: string
}

export default function TopicEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/topics/${id}`)
      setTopic(res.data)
      setTitle(res.data?.title ?? '')
      setContent(res.data?.content ?? '')
    }
    load().catch(() => setTopic(null))
  }, [id])

  const save = async () => {
    if (!id) return
    await api.put(`/topics/${id}`, { title, content, contentType: 'text' })
    navigate(-1)
  }

  if (!topic) return <Typography>Loading...</Typography>

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">Edit Topic</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Write formatted content using the editor below.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <TextField label="Topic title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Editor
            value={content}
            onEditorChange={setContent}
            init={{
              height: 300,
              apiKey: ENV.TINYMCE_API_KEY,
              menubar: true,
              plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'],
              toolbar: 'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image code fullscreen',
              setup: (editor: any) => {
                editor.on('change', () => editor.save())
              }
            }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={save} disabled={!title.trim()}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}
