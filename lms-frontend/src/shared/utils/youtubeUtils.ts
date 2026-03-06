export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([^&\n?#]+)$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

export function isYoutubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url)
}

export function parseContentForYoutube(html: string): { hasYoutube: boolean; youtubeIds: string[] } {
  const youtubeIds: string[] = []
  
  // Extract URLs from href attributes
  const hrefRegex = /href=["']([^"']+)["']/g
  let match
  while ((match = hrefRegex.exec(html)) !== null) {
    if (isYoutubeUrl(match[1])) {
      const id = extractYoutubeId(match[1])
      if (id && !youtubeIds.includes(id)) {
        youtubeIds.push(id)
      }
    }
  }

  // Also check for plain YouTube URLs in text content
  const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s<>"']+)/g
  while ((match = urlRegex.exec(html)) !== null) {
    const id = extractYoutubeId(match[1])
    if (id && !youtubeIds.includes(id)) {
      youtubeIds.push(id)
    }
  }

  return {
    hasYoutube: youtubeIds.length > 0,
    youtubeIds
  }
}

export function removeYoutubeLinks(html: string): string {
  // Remove YouTube links from href attributes
  let cleaned = html.replace(
    /href=["']([^"']*(?:youtube\.com|youtu\.be)[^"']*)['">[^>]*>([^<]*)<\/a>/g,
    ''
  )
  
  // Remove plain YouTube URLs
  cleaned = cleaned.replace(
    /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s<>"']+)/g,
    ''
  )
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  return cleaned
}
