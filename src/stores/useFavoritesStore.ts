
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

        const { data, error } = await supabase
          .from('favorites')
          .select('items(*)')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading favorites:', error);
          return;
        }

        const favorites = (data as unknown as ItemData[]).map(fav => ({
          id: fav.items.id,
          image: fav.items.image || '',
          title: fav.items.name || '',
          price: fav.items.price || '',
          category: fav.items.type || ''
        }));

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
