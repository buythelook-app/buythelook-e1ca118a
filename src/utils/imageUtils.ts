export const transformImageUrl = (url: string) => {
  if (!url) return '';
  return url.replace(
    'http://preview--ai-bundle-construct-20.lovable.app',
    'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'
  ).replace(
    'https://preview--ai-bundle-construct-20.lovable.app',
    'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'
  );
};

export const validateImageUrl = (url: string): boolean => {
  return url && (
    url.startsWith('http://preview--ai-bundle-construct-20.lovable.app') ||
    url.startsWith('https://preview--ai-bundle-construct-20.lovable.app') ||
    url.startsWith('https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com')
  );
};