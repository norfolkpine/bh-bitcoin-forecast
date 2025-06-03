import html2canvas from 'html2canvas'

interface ExportOptions {
  elementId: string
  fileName?: string
  theme?: 'dark' | 'light'
  padding?: number
  watermark?: boolean
  scale?: number
}

export async function exportElementAsImage({
  elementId,
  theme = 'light',
  padding = 32,
  watermark = true,
  scale = 2
}: ExportOptions) {
  const element = document.getElementById(elementId)
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor: theme === 'dark' ? '#020817' : '#ffffff',
    })

    // Create padded canvas
    const paddedCanvas = document.createElement('canvas')
    paddedCanvas.width = canvas.width + padding * 2
    paddedCanvas.height = canvas.height + padding * 2
    
    const ctx = paddedCanvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = theme === 'dark' ? '#020817' : '#ffffff'
    ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height)
    ctx.drawImage(canvas, padding, padding)

    if (watermark) {
      const watermarkImg = new Image()
      watermarkImg.src = theme === 'dark' 
        ? '/images/watermark/benheath_light.png' 
        : '/images/watermark/benheath_dark.png'
      
      await new Promise((resolve) => {
        watermarkImg.onload = () => {
          const watermarkWidth = paddedCanvas.width * 0.15
          const ratio = watermarkImg.height / watermarkImg.width
          const watermarkHeight = watermarkWidth * ratio

          const x = 16
          const y = paddedCanvas.height - watermarkHeight - 16

          ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight)
          resolve(null)
        }
      })
    }

    return paddedCanvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error generating image:', error)
    return null
  }
}

export async function shareImage(imageUrl: string, platform: 'twitter' | 'facebook' | 'linkedin' | 'download', fileName = 'export.png') {
  if (platform === 'download') {
    const link = document.createElement('a')
    link.download = fileName
    link.href = imageUrl
    link.click()
    return
  }

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=Check out this cryptocurrency chart!`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
  }
  
  window.open(shareUrls[platform], '_blank')
} 