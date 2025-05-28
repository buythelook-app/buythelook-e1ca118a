
import { create } from 'zustand';

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

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],
  loadFavorites: async () => {
    console.log('Favorites loaded from memory');
  },
  addFavorite: async (look) => {
    set(state => ({
      favorites: [...state.favorites, look]
    }));
    console.log('Favorite added to memory');
  },
  removeFavorite: async (id) => {
    set(state => ({
      favorites: state.favorites.filter(look => look.id !== id)
    }));
    console.log('Favorite removed from memory');
  },
  isFavorite: (id) => {
    return get().favorites.some(look => look.id === id);
  }
}));
