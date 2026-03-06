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
      <DialogTitle className="font-semibold">Completion Certificate</DialogTitle>
      <DialogContent className="p-6">
        <div className="space-y-6">
          {/* Certificate Preview */}
          <div
            ref={certificateRef}
            className="relative flex flex-col justify-around items-center min-h-[400px] p-8 text-center bg-gradient-to-br from-gray-100 to-blue-100 border-4 border-yellow-600 rounded-lg"
          >
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-8 h-8 border-2 border-yellow-600 rounded" />
            <div className="absolute top-2 right-2 w-8 h-8 border-2 border-yellow-600 rounded" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-2 border-yellow-600 rounded" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-2 border-yellow-600 rounded" />

            <div className="z-10 w-full">
              {/* Header */}
              <div className="uppercase font-bold text-3xl text-blue-900 tracking-widest mb-2">Certificate</div>
              <div className="font-semibold text-2xl text-blue-900 tracking-wide mb-6">of Completion</div>

              {/* Body Text */}
              <div className="italic text-gray-700 mb-4 text-lg">This is to certify that</div>

              {/* Name */}
              <div className="font-bold text-xl text-yellow-900 mb-4 border-b-2 border-yellow-600 pb-2 min-h-[30px]">{userName}</div>

              {/* Achievement Text */}
              <div className="text-gray-700 mb-2 text-lg">has successfully completed the course</div>

              {/* Course Name */}
              <div className="font-bold text-xl text-blue-900 mb-4 border-b-2 border-yellow-600 pb-2">{courseName}</div>

              {/* Completion Date */}
              <div className="text-gray-700 mt-6 text-base">Date of Completion: <strong>{formatDate(completionDate)}</strong></div>

              {/* Email */}
              <div className="text-gray-500 mt-2 text-sm">{userEmail}</div>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions className="p-4">
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
