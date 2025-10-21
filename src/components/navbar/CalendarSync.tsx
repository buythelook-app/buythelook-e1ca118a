import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const CALENDAR_SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export const useCalendarSync = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCalendarSync = async () => {
    setIsLoading(true);
    
    try {
      // קבלת Client ID מ-edge function (נשמור בסודות)
      const clientIdResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-sync?getClientId=true`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      
      const { clientId } = await clientIdResponse.json();
      
      if (!clientId) {
        toast({
          title: "שגיאה בתצורה",
          description: "לא ניתן לאתר את הגדרות Google Calendar",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // יצירת popup לאימות Google
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(CALENDAR_SCOPES)}&` +
        `prompt=consent`;

      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'Google Calendar Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        toast({
          title: "חלון נחסם",
          description: "אנא אפשרי חלונות קופצים עבור האתר",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // האזנה להודעה מה-popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_CALENDAR_AUTH') {
          const { accessToken, error } = event.data;
          
          if (error) {
            toast({
              title: "שגיאת אימות",
              description: error,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }

          if (accessToken) {
            // קריאה ל-edge function עם ה-access token
            syncCalendarEvents(accessToken);
          }

          window.removeEventListener('message', messageListener);
        }
      };

      window.addEventListener('message', messageListener);

      // סגירת ה-listener אחרי 5 דקות
      setTimeout(() => {
        window.removeEventListener('message', messageListener);
        setIsLoading(false);
      }, 300000);

    } catch (error) {
      console.error('Calendar sync error:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בסנכרון היומן",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const syncCalendarEvents = async (accessToken: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ accessToken }),
        }
      );

      const data = await response.json();

      if (data.error) {
        toast({
          title: "שגיאה בסנכרון",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "היומן סונכרן בהצלחה",
        description: `נמצאו ${data.events?.length || 0} אירועים קרובים`,
      });

      console.log('Calendar events:', data.events);
    } catch (error) {
      console.error('Error syncing calendar:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בקבלת אירועי היומן",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleCalendarSync, isLoading };
};