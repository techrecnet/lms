import { Container } from '@mui/material'
import PublicHeader from '../../shared/components/PublicHeader'
import PublicFooter from '../../shared/components/PublicFooter'

export default function FaqPage() {
  return (
    <div className="min-h-screen pt-28">
      <PublicHeader hideBanner forceSolid />
      <Container maxWidth="md" className="py-12">
        <h1 className="text-3xl font-bold mb-4">FAQ</h1>
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold">How do I enroll in a course?</h4>
            <p>Sign up for an account, browse courses, and click enroll.</p>
          </div>
          <div>
            <h4 className="font-semibold">How long do I have access?</h4>
            <p>You have lifetime access to all course materials after enrollment.</p>
          </div>
        </div>
      </Container>
      <PublicFooter />
    </div>
  )
}
