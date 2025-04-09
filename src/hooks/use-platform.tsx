
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'mobile' | 'unknown';

export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect platform
    const detectPlatform = () => {
      try {
        const isNative = Capacitor.isNativePlatform();
        setPlatform(isNative ? 'mobile' : 'web');
      } catch (error) {
        console.error('Platform detection error:', error);
        setPlatform('web'); // Default to web on error
      } finally {
        setIsLoading(false);
      }
    };

    detectPlatform();
  }, []);

  const isMobile = platform === 'mobile';
  const isWeb = platform === 'web';

  return { platform, isLoading, isMobile, isWeb };
}

// Helper function to get platform without hooks (for non-React contexts)
export function getPlatform(): Platform {
  try {
    return Capacitor.isNativePlatform() ? 'mobile' : 'web';
  } catch (error) {
    console.error('Static platform detection error:', error);
    return 'web'; // Default to web on error
  }
}
