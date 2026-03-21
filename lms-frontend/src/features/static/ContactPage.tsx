import { Container } from '@mui/material'
import PublicHeader from '../../shared/components/PublicHeader'
import PublicFooter from '../../shared/components/PublicFooter'

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-28 bg-white">
      <PublicHeader hideBanner forceSolid />
      <Container maxWidth="md" className="py-12">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-700 mb-6">You can reach us at support@recent.example or use the contact form below.</p>
        <form className="space-y-4">
          <input className="w-full p-3 border rounded" placeholder="Your name" />
          <input className="w-full p-3 border rounded" placeholder="Email" />
          <textarea className="w-full p-3 border rounded" placeholder="Message" rows={6} />
          <button className="px-6 py-3 bg-purple-700 text-white rounded-full">Send Message</button>
        </form>
      </Container>
      <PublicFooter />
    </div>
  )
}
