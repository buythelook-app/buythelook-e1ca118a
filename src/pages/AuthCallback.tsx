import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthLoader } from '@/components/auth/AuthLoader';
import logger from '@/lib/logger';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔵 AUTH CALLBACK STARTED');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);
        
        logger.info('Auth callback started', {
          data: {
            url: window.location.href,
            hash: window.location.hash,
            search: window.location.search
          }
        });
        
        // Check if we have OAuth params in the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        const hasOAuthParams = 
          hashParams.has('access_token') || 
          hashParams.has('code') ||
          searchParams.has('code') ||
          searchParams.has('access_token');
        
        console.log('Has OAuth params:', hasOAuthParams);
        
        if (hasOAuthParams) {
          console.log('🟢 Processing OAuth callback with params');
          
          // Supabase will automatically handle the OAuth callback
          // We just need to wait a bit and then check the session
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          console.log('Session check result:', {
            hasSession: !!session,
            userId: session?.user?.id,
            error: error?.message
          });
          
          if (error) {
            console.error('❌ Session error:', error);
            logger.error('Session error:', { data: { error: error.message } });
            navigate('/auth', { replace: true });
            return;
          }

          if (session) {
            console.log('✅ Session found! Redirecting to home');
            logger.info('Session found, user authenticated', { 
              data: { 
                userId: session.user.id,
                email: session.user.email,
                provider: session.user.app_metadata?.provider
              } 
            });
            
            // Navigate to home
            navigate('/', { replace: true });
          } else {
            console.warn('⚠️ No session found after OAuth callback');
            logger.warn('No session found after OAuth callback');
            navigate('/auth', { replace: true });
          }
        } else {
          console.log('⚠️ No OAuth params found, redirecting to auth');
          logger.info('No OAuth params in URL');
          navigate('/auth', { replace: true });
        }
      } catch (err: any) {
        console.error('❌ Callback error:', err);
        logger.error('Callback error:', { data: { error: err.message } });
        navigate('/auth', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return <AuthLoader />;
  }

  return null;
}
