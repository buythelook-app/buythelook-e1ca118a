import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Define types for the Calendar API
interface CalendarAPI {
  requestPermission: () => Promise<'granted' | 'denied'>;
  sync: () => Promise<void>;
}

declare global {
  interface Navigator {
    standalone?: boolean;
    calendar?: CalendarAPI;
  }
}

export const useCalendarSync = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isTestMode = true;

  const handleCalendarSync = async () => {
    if (!isTestMode) {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          navigator.standalone || 
                          document.referrer.includes('android-app://');

      if (!isMobile || !isStandalone) {
        toast({
          title: "Calendar Sync",
          description: "Calendar sync is only available in our mobile app. Please install and open our app.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (isTestMode) {
        toast({
          title: "Test Mode Calendar Sync",
          description: "Calendar sync simulation successful!",
        });
        return;
      }

      if ('calendar' in navigator && navigator.calendar) {
        const permission = await navigator.calendar.requestPermission();
        
        if (permission === 'granted') {
          if (navigator.calendar.sync) {
            await navigator.calendar.sync();
            toast({
              title: "Calendar Synced",
              description: "Your calendar has been successfully synced.",
            });
          } else {
            throw new Error('Calendar sync method not available');
          }
        } else {
          toast({
            title: "Calendar Sync Failed",
            description: "Calendar permission was denied. Please enable calendar access in your device settings.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Calendar Sync",
          description: "Calendar API is not supported on your device. Please make sure you're using our latest mobile app version.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Calendar sync error:', error);
      toast({
        title: "Calendar Sync Error",
        description: "An error occurred while syncing your calendar. Please try again or update your app.",
        variant: "destructive",
      });
    }
  };

  return { handleCalendarSync };
};