import { Container } from '@mui/material'
import PublicHeader from '../../shared/components/PublicHeader'
import PublicFooter from '../../shared/components/PublicFooter'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28">
      <PublicHeader hideBanner forceSolid />
      <Container maxWidth="md" className="py-12">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-700">[Insert Privacy Policy content here]</p>
      </Container>
      <PublicFooter />
    </div>
  )
}
