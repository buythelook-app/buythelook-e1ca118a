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
        logger.info('Auth callback started');
        
        // Check if this is a popup window
        const isPopup = window.opener && window.opener !== window;
        
        // Wait a moment for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the session after authentication
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Session error:', { data: { error: error.message } });
          if (isPopup) {
            window.close();
          } else {
            navigate('/auth');
          }
          return;
        }

        if (session) {
          logger.info('Session found, user authenticated', { 
            data: { userId: session.user.id } 
          });
          
          if (isPopup) {
            // If this is a popup, just close it - the main window will handle navigation
            logger.info('Closing popup window');
            window.close();
          } else {
            // If not a popup, navigate normally
            navigate('/');
          }
        } else {
          logger.info('No session found');
          if (isPopup) {
            window.close();
          } else {
            navigate('/auth');
          }
        }
      } catch (err: any) {
        logger.error('Callback error:', { data: { error: err.message } });
        const isPopup = window.opener && window.opener !== window;
        if (isPopup) {
          window.close();
        } else {
          navigate('/auth');
        }
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
