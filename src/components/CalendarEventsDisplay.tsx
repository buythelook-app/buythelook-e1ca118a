import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  event_type: string;
  suggested_look_ids?: string[];
}

const eventTypeLabels: Record<string, string> = {
  wedding: "חתונה",
  meeting: "פגישה",
  conference: "כנס",
  vacation: "חופשה",
  interview: "ראיון עבודה",
  party: "מסיבה",
  sport: "פעילות ספורט",
  dining: "ארוחה",
  entertainment: "בילוי",
  general: "כללי",
};

const eventStyleSuggestions: Record<string, string> = {
  wedding: "אלגנטי ומכובד - שמלה או חליפה רשמית",
  meeting: "מקצועי ועסקי - מתאים לסביבת עבודה",
  conference: "פורמלי אך נוח - חליפה או שמלה עם נעליים נוחות",
  vacation: "קז'ואל ונוח - בגדי קיץ רגועים",
  interview: "פורמלי ומקצועי - להרשמה ראשונה מעולה",
  party: "אופנתי ומרהיב - להרשים ולזרוח",
  sport: "ספורטיבי ונוח - בגדי אימון איכותיים",
  dining: "אלגנטי קז'ואל - מתאים לארוחה יוקרתית",
  entertainment: "סטייל חופשי - תלוי במקום",
  general: "תלוי באירוע הספציפי",
};

export const CalendarEventsDisplay = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      if (error) throw error;

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את האירועים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetLookSuggestions = (event: CalendarEvent) => {
    // ניווט לדף הצעת לוקים עם פרמטרים של האירוע
    navigate(`/outfit-generation?eventType=${event.event_type}&eventName=${encodeURIComponent(event.title)}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">אין אירועים קרובים</h3>
        <p className="text-muted-foreground">
          סנכרני את היומן שלך כדי לקבל הצעות לוקים מותאמות לאירועים שלך
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">האירועים הקרובים שלך</h2>
      
      {events.map((event) => (
        <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold">{event.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {eventTypeLabels[event.event_type] || event.event_type}
                </span>
              </div>
              
              {event.description && (
                <p className="text-muted-foreground mb-3">{event.description}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(event.start_time).toLocaleDateString('he-IL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 p-3 bg-accent/50 rounded-lg">
                <p className="text-sm">
                  <strong>המלצת סטייל:</strong> {eventStyleSuggestions[event.event_type]}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleGetLookSuggestions(event)}
            className="w-full mt-4"
            variant="default"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            הצג לוקים מתאימים לאירוע זה
          </Button>
        </Card>
      ))}
    </div>
  );
};
