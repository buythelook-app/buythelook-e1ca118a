import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthLoader } from '@/components/auth/AuthLoader';
import logger from '@/lib/logger';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        logger.info('Auth callback started');
        
        // Get the session after authentication
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Session error:', { data: { error: error.message } });
          navigate('/auth');
          return;
        }

        if (session) {
          logger.info('Session found, user authenticated', { 
            data: { userId: session.user.id } 
          });

          // Profile is automatically created by trigger
          // Navigate to home page
          navigate('/');
        } else {
          logger.info('No session found, redirecting to auth');
          navigate('/auth');
        }
      } catch (err: any) {
        logger.error('Callback error:', { data: { error: err.message } });
        navigate('/auth');
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
