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
  addFavorite: (look: FavoriteLook) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (look) => {
        set((state) => ({
          favorites: [...state.favorites, look],
        }));
      },
      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((look) => look.id !== id),
        }));
      },
      isFavorite: (id) => {
        return get().favorites.some((look) => look.id === id);
      },
    }),
    {
      name: 'favorites-storage',
    }
  )
);