
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
  
  // Transform http URLs from the review environment to https
  if (url.startsWith('http://review--ai-bundle-construct-20.lovable.app')) {
    return url.replace(
      'http://review--ai-bundle-construct-20.lovable.app',
      'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'
    );
  }
  
  // If it's an http URL but not from our domain, we still try to use https
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  // For imgur and other common image hosts, ensure we're using https
  if (url.includes('imgur.com')) {
    if (url.startsWith('//')) {
      return `https:${url}`;
    } else if (!url.startsWith('https://')) {
      return `https://${url.replace('http://', '')}`;
    }
  }
  
  // If the URL doesn't have a protocol, assume it's HTTPS
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
  
  // Accept our specific domains
  return (
    url.startsWith('http://review--ai-bundle-construct-20.lovable.app') ||
    url.startsWith('https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com') ||
    url.includes('imgur.com')
  );
};
