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
        
        // Check if we're in a popup (opened by window.open)
        const isPopup = window.opener && window.opener !== window;
        console.log('Is popup:', isPopup);
        
        logger.info('Auth callback started', {
          data: {
            url: window.location.href,
            hash: window.location.hash,
            search: window.location.search,
            isPopup
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
          
          // Check if we have a code that needs to be exchanged
          const code = searchParams.get('code') || hashParams.get('code');
          
          if (code) {
            console.log('🔄 Exchanging code for session');
            logger.info('Exchanging OAuth code for session');
            
            const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error('❌ Code exchange error:', exchangeError);
              logger.error('Code exchange error:', { data: { error: exchangeError.message } });
              
              // Notify parent window if in popup
              if (isPopup && window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_ERROR',
                  error: exchangeError.message
                }, window.location.origin);
                window.close();
                return;
              }
              
              navigate('/auth', { replace: true });
              return;
            }
            
            if (session) {
              console.log('✅ Session created from code! Notifying parent window');
              logger.info('Session created from OAuth code', { 
                data: { 
                  userId: session.user.id,
                  email: session.user.email,
                  provider: session.user.app_metadata?.provider
                } 
              });
              
              // Notify parent window if in popup
              if (isPopup && window.opener) {
                console.log('📤 Sending success message to parent window');
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  session: {
                    userId: session.user.id,
                    email: session.user.email
                  }
                }, window.location.origin);
                
                // Close popup after a short delay
                setTimeout(() => {
                  window.close();
                }, 500);
                return;
              }
              
              navigate('/', { replace: true });
              return;
            }
          }
          
          // If no code, check for access_token (implicit flow)
          const accessToken = hashParams.get('access_token');
          if (accessToken) {
            console.log('🔄 Found access token in hash');
            // Wait a bit for Supabase to process the hash automatically
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          console.log('Session check result:', {
            hasSession: !!session,
            userId: session?.user?.id,
            error: error?.message
          });
          
          if (error) {
            console.error('❌ Session error:', error);
            logger.error('Session error:', { data: { error: error.message } });
            
            // Notify parent window if in popup
            if (isPopup && window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: error.message
              }, window.location.origin);
              window.close();
              return;
            }
            
            navigate('/auth', { replace: true });
            return;
          }

          if (session) {
            console.log('✅ Session found! Notifying parent window');
            logger.info('Session found, user authenticated', { 
              data: { 
                userId: session.user.id,
                email: session.user.email,
                provider: session.user.app_metadata?.provider
              } 
            });
            
            // Notify parent window if in popup
            if (isPopup && window.opener) {
              console.log('📤 Sending success message to parent window');
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                session: {
                  userId: session.user.id,
                  email: session.user.email
                }
              }, window.location.origin);
              
              // Close popup after a short delay
              setTimeout(() => {
                window.close();
              }, 500);
              return;
            }
            
            // Navigate to home if not in popup
            navigate('/', { replace: true });
          } else {
            console.warn('⚠️ No session found after OAuth callback');
            logger.warn('No session found after OAuth callback');
            
            // Notify parent window if in popup
            if (isPopup && window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'No session created'
              }, window.location.origin);
              window.close();
              return;
            }
            
            navigate('/auth', { replace: true });
          }
        } else {
          console.log('⚠️ No OAuth params found, redirecting to auth');
          logger.info('No OAuth params in URL');
          
          // If in popup, just close it
          if (isPopup && window.opener) {
            window.close();
            return;
          }
          
          navigate('/auth', { replace: true });
        }
      } catch (err: any) {
        console.error('❌ Callback error:', err);
        logger.error('Callback error:', { data: { error: err.message } });
        
        const isPopup = window.opener && window.opener !== window;
        if (isPopup && window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: err.message
          }, window.location.origin);
          window.close();
          return;
        }
        
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
