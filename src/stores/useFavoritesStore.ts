
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface FavoriteLook {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
  items?: Array<{ 
    id: string; 
    image: string; 
    name?: string;
    price?: string;
    type?: string;
  }>;
}

interface FavoritesStore {
  favorites: FavoriteLook[];
  addFavorite: (look: FavoriteLook) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  loadFavorites: () => Promise<void>;
}

interface ItemData {
  items: {
    id: string;
    image: string | null;
    name: string | null;
    price: string | null;
    type: string | null;
  };
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      loadFavorites: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // First, fetch the favorite items
        const { data, error } = await supabase
          .from('favorites')
          .select('item_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading favorites:', error);
          return;
        }

        if (!data || data.length === 0) {
          console.log('No favorites found for user');
          set({ favorites: [] });
          return;
        }

        // Extract item IDs
        const itemIds = data.map(fav => fav.item_id).filter(Boolean);
        
        if (itemIds.length === 0) {
          console.log('No valid item IDs found in favorites');
          set({ favorites: [] });
          return;
        }

        // Now fetch the actual items data
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .in('id', itemIds);

        if (itemsError) {
          console.error('Error loading item details:', itemsError);
          return;
        }

        // Convert to favorites format
        const favorites = itemsData.map(item => ({
          id: item.id,
          image: item.image || '',
          title: item.name || '',
          price: item.price || '',
          category: item.type || '',
          items: [{
            id: item.id,
            image: item.image || '',
            name: item.name || '',
            price: item.price || '',
            type: item.type || ''
          }]
        }));

        console.log('Loaded favorites with items:', favorites);
        set({ favorites });
      },
      addFavorite: async (look) => {
        console.log('Adding favorite with items:', look);
        const { data: { user } } = await supabase.auth.getUser();
        
        // For client-side only storage when user is not authenticated
        if (!user) {
          set(state => ({
            favorites: [...state.favorites.filter(f => f.id !== look.id), look]
          }));
          return;
        }

        try {
          const { error } = await supabase
            .from('favorites')
            .insert({
              user_id: user.id,
              item_id: look.id
            });

          if (error) {
            console.error('Error adding favorite to Supabase:', error);
          }
        } catch (e) {
          console.error('Failed to add to Supabase favorites:', e);
        }

        // Always update local state regardless of API success
        set(state => ({
          favorites: [...state.favorites.filter(f => f.id !== look.id), look]
        }));
      },
      removeFavorite: async (id) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          try {
            const { error } = await supabase
              .from('favorites')
              .delete()
              .eq('user_id', user.id)
              .eq('item_id', id);

            if (error) {
              console.error('Error removing favorite:', error);
            }
          } catch (e) {
            console.error('Failed to remove from Supabase favorites:', e);
          }
        }

        // Always update local state regardless of API success
        set(state => ({
          favorites: state.favorites.filter(look => look.id !== id)
        }));
      },
      isFavorite: (id) => {
        return get().favorites.some(look => look.id === id);
      }
    }),
    {
      name: 'favorites-storage',
    }
  )
);
