export function getContentFromHtml(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    
    const text = div.textContent || div.innerText
    
    return text || 'Untitled' // fallback if no text found
  }

export function getTruncatedTitle(text: string, maxLength: number = 30): string {
  if (!text) return 'Untitled'
  
  if (text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength) + '...'
}
