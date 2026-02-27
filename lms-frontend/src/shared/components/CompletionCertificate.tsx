import { useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Paper,
  Typography,
  Stack,
} from '@mui/material'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface CompletionCertificateProps {
  open: boolean
  onClose: () => void
  courseName: string
  userName: string
  userEmail: string
  completionDate: string
}

export default function CompletionCertificate({
  open,
  onClose,
  courseName,
  userName,
  userEmail,
  completionDate,
}: CompletionCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null)

  const downloadPDF = async () => {
    if (!certificateRef.current) return

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${userName}-${courseName}-certificate.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return date
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Completion Certificate</DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Certificate Preview */}
          <Paper
            ref={certificateRef}
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              minHeight: 400,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              position: 'relative',
              border: '3px solid #d4af37',
              borderRadius: 2,
            }}
          >
            {/* Decorative corners */}
            <Box sx={{ position: 'absolute', top: 10, left: 10, width: 30, height: 30, border: '2px solid #d4af37' }} />
            <Box sx={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, border: '2px solid #d4af37' }} />
            <Box sx={{ position: 'absolute', bottom: 10, left: 10, width: 30, height: 30, border: '2px solid #d4af37' }} />
            <Box sx={{ position: 'absolute', bottom: 10, right: 10, width: 30, height: 30, border: '2px solid #d4af37' }} />

            <Box sx={{ zIndex: 1 }}>
              {/* Header */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1a237e',
                  letterSpacing: 2,
                  mb: 1,
                  textTransform: 'uppercase',
                }}
              >
                Certificate
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#1a237e',
                  letterSpacing: 1,
                  mb: 3,
                }}
              >
                of Completion
              </Typography>

              {/* Body Text */}
              <Typography
                variant="body1"
                sx={{
                  color: '#424242',
                  mb: 2,
                  fontStyle: 'italic',
                }}
              >
                This is to certify that
              </Typography>

              {/* Name */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#8b4513',
                  mb: 2,
                  borderBottom: '2px solid #d4af37',
                  pb: 1,
                  minHeight: 30,
                }}
              >
                {userName}
              </Typography>

              {/* Achievement Text */}
              <Typography
                variant="body1"
                sx={{
                  color: '#424242',
                  mb: 1,
                }}
              >
                has successfully completed the course
              </Typography>

              {/* Course Name */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1a237e',
                  mb: 2,
                  borderBottom: '2px solid #d4af37',
                  pb: 1,
                }}
              >
                {courseName}
              </Typography>

              {/* Completion Date */}
              <Typography
                variant="body2"
                sx={{
                  color: '#424242',
                  mt: 3,
                }}
              >
                Date of Completion: <strong>{formatDate(completionDate)}</strong>
              </Typography>

              {/* Email */}
              <Typography
                variant="caption"
                sx={{
                  color: '#666',
                  mt: 1,
                  display: 'block',
                }}
              >
                {userEmail}
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          onClick={downloadPDF}
          variant="contained"
        >
          Download as PDF
        </Button>
      </DialogActions>
    </Dialog>
  )
}
