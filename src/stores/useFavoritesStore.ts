
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteLook {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
}

interface FavoritesStore {
  favorites: FavoriteLook[];
  addFavorite: (look: FavoriteLook) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  loadFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      loadFavorites: async () => {
        // For now, just use the persisted data since we don't have a favorites table
        console.log('Favorites loaded from local storage');
      },
      addFavorite: async (look) => {
        set(state => ({
          favorites: [...state.favorites, look]
        }));
        console.log('Favorite added to local storage');
      },
      removeFavorite: async (id) => {
        set(state => ({
          favorites: state.favorites.filter(look => look.id !== id)
        }));
        console.log('Favorite removed from local storage');
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
