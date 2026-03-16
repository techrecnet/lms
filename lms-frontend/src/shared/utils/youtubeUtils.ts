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
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Replace anchor tags that point to YouTube with their text content
    doc.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href') || ''
      if (isYoutubeUrl(href)) {
        const text = a.textContent || ''
        const textNode = doc.createTextNode(text)
        a.parentNode?.replaceChild(textNode, a)
      }
    })

    // Remove plain YouTube URLs from text nodes
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      if (!node.nodeValue) continue
      const newVal = node.nodeValue.replace(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s<>"']+/g, '')
      if (newVal !== node.nodeValue) node.nodeValue = newVal
    }

    const cleaned = doc.body.innerHTML.replace(/^\s+|\s+$/g, '')
    return cleaned
  } catch (e) {
    // Fallback to regex-based removal if DOMParser isn't available
    let cleaned = html.replace(/href=["']([^"']*(?:youtube\.com|youtu\.be)[^"']*)['">[^>]*>([^<]*)<\/a>/g, '')
    cleaned = cleaned.replace(/(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s<>"']+)/g, '')
    return cleaned.replace(/^\s+|\s+$/g, '')
  }
}
