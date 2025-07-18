import { supabase } from '@/lib/supabase';

export interface ClickEvent {
  user_id?: string;
  item_id: string;
  category: 'top' | 'bottom' | 'shoes';
  timestamp?: string;
}

export class ClickTrackingService {
  static async trackClick(clickData: ClickEvent) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Using type assertion to bypass type checking until types are updated
      const { error } = await (supabase as any)
        .from('click_events')
        .insert({
          user_id: user?.id,
          item_id: clickData.item_id,
          category: clickData.category,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking click:', error);
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  static async getClickEvents(userId?: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('click_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching click events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching click events:', error);
      return [];
    }
  }
}