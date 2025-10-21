import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ניתוח סוג האירוע לפי הכותרת
function detectEventType(summary: string, description?: string): string {
  const text = `${summary} ${description || ''}`.toLowerCase();
  
  if (text.includes('חתונה') || text.includes('wedding')) return 'wedding';
  if (text.includes('פגישה') || text.includes('meeting') || text.includes('ישיבה')) return 'meeting';
  if (text.includes('כנס') || text.includes('conference') || text.includes('סמינר')) return 'conference';
  if (text.includes('חופשה') || text.includes('vacation') || text.includes('נופש')) return 'vacation';
  if (text.includes('ראיון') || text.includes('interview')) return 'interview';
  if (text.includes('מסיבה') || text.includes('party') || text.includes('חגיגה')) return 'party';
  if (text.includes('ספורט') || text.includes('sport') || text.includes('כושר')) return 'sport';
  if (text.includes('ארוחה') || text.includes('dinner') || text.includes('לאנץ')) return 'dining';
  if (text.includes('תיאטרון') || text.includes('קולנוע') || text.includes('הצגה')) return 'entertainment';
  
  return 'general';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // בדיקה אם מבקשים את ה-Client ID
    const url = new URL(req.url);
    if (url.searchParams.get('getClientId') === 'true') {
      const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
      return new Response(
        JSON.stringify({ clientId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { accessToken } = await req.json();

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Access token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // יצירת Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // קבלת המשתמש הנוכחי
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching calendar events for user:', user.id);

    // קריאה ל-Google Calendar API לקבלת אירועים קרובים (30 יום קדימה)
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      console.error('Google Calendar API error:', calendarResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch calendar events',
          details: errorText 
        }),
        { status: calendarResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const calendarData = await calendarResponse.json();
    const events = calendarData.items || [];
    
    console.log('Successfully fetched calendar events:', events.length);

    // שמירת האירועים בדאטה-בייס
    const savedEvents = [];
    for (const event of events) {
      if (!event.start?.dateTime && !event.start?.date) continue;
      
      const startTime = event.start.dateTime || event.start.date;
      const endTime = event.end?.dateTime || event.end?.date;
      const eventType = detectEventType(event.summary, event.description);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .upsert({
          user_id: user.id,
          google_event_id: event.id,
          title: event.summary || 'ללא כותרת',
          description: event.description,
          start_time: startTime,
          end_time: endTime,
          location: event.location,
          event_type: eventType,
          is_synced: true,
        }, {
          onConflict: 'user_id,google_event_id'
        })
        .select()
        .single();
      
      if (!error && data) {
        savedEvents.push({
          ...data,
          google_data: {
            htmlLink: event.htmlLink,
            hangoutLink: event.hangoutLink,
          }
        });
      }
    }

    console.log('Saved events to database:', savedEvents.length);

    return new Response(
      JSON.stringify({ 
        success: true,
        events: savedEvents,
        message: `נמצאו ${savedEvents.length} אירועים קרובים`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Calendar sync error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
