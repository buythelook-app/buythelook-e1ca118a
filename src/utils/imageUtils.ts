
export const transformImageUrl = (url: string) => {
  if (!url) return '';
  
  // Check if URL includes "imgur" but returns an error
  if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
    console.log('Converting imgur URL to direct image URL:', url);
    // Try to convert to direct image URL format
    return url.replace('imgur.com', 'i.imgur.com') + '.png';
  }
  
  // Handle relative paths to public folder
  if (url.startsWith('/')) {
    console.log('Using local path:', url);
    // Add base URL for local paths if we're in a deployed environment
    const baseUrl = window.location.origin;
    return `${baseUrl}${url}`;
  }
  
  // Check if URL already has https protocol
  if (url.startsWith('https://')) {
    console.log('Using existing HTTPS URL:', url);
    return url;
  }
  
  // Transform http URLs to https
  if (url.startsWith('http://')) {
    console.log('Converting HTTP to HTTPS:', url);
    return url.replace('http://', 'https://');
  }
  
  // If URL doesn't have a protocol, assume it's HTTPS
  if (!url.includes('://') && !url.startsWith('/')) {
    console.log('Adding HTTPS protocol to URL:', url);
    return `https://${url}`;
  }
  
  console.log('Using URL as-is:', url);
  return url;
};

export const validateImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Accept local paths
  if (url.startsWith('/')) return true;
  
  // Accept all https URLs
  if (url.startsWith('https://')) return true;
  
  // Accept http URLs (will be transformed to https)
  if (url.startsWith('http://')) return true;
  
  return false;
};

// Add a helper function to get default images by type
export const getDefaultImageByType = (type: string): string => {
  const defaultImages = {
    top: 'https://i.imgur.com/1j9ZXed.png',
    bottom: 'https://i.imgur.com/RWCV0G0.png',
    shoes: 'https://i.imgur.com/PzAHrXN.png',
    dress: 'https://i.imgur.com/1j9ZXed.png',
    accessory: 'https://i.imgur.com/1j9ZXed.png',
    outerwear: 'https://i.imgur.com/1j9ZXed.png',
    default: 'https://i.imgur.com/1j9ZXed.png'
  };
  
  return defaultImages[type as keyof typeof defaultImages] || defaultImages.default;
};
