
export const transformImageUrl = (url: string) => {
  if (!url) return '';
  
  // Handle relative paths to public folder
  if (url.startsWith('/')) {
    return url;
  }
  
  // Check if URL already has https protocol
  if (url.startsWith('https://')) {
    return url;
  }
  
  // Transform http URLs to https
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  // If URL doesn't have a protocol, assume it's HTTPS
  if (!url.includes('://') && !url.startsWith('/')) {
    return `https://${url}`;
  }
  
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
