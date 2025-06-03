export const shareLink = (target: string, link: string, text: string) => {
  let url = '';
  const encodedLink = encodeURIComponent(link);
  const encodedText = encodeURIComponent(text);

  switch (target) {
    case 'twitter':
      url = `https://twitter.com/intent/tweet?url=${encodedLink}&text=${encodedText}`;
      break;
    case 'facebook':
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedText}`;
      break;
    case 'linkedin':
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
      break;
    case 'whatsapp':
      url = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedLink}`;
      break;
    case 'instagram':
      url = `https://www.instagram.com/?url=${encodedLink}`;
      break;
    case 'telegram':
      url = `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
      break;
    case 'pinterest':
      url = `https://pinterest.com/pin/create/button/?url=${encodedLink}&description=${encodedText}`;
      break;
    default:
      url = link;
  }
  window.open(url, '_blank')
};


