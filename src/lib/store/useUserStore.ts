import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  bookmarks: string[];
  recentlyViewed: string[];
  toggleBookmark: (formulaId: string) => void;
  addRecentlyViewed: (formulaId: string) => void;
  isBookmarked: (formulaId: string) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      recentlyViewed: [],
      toggleBookmark: (formulaId: string) => {
        const { bookmarks } = get();
        if (bookmarks.includes(formulaId)) {
          set({ bookmarks: bookmarks.filter((id) => id !== formulaId) });
        } else {
          set({ bookmarks: [...bookmarks, formulaId] });
        }
      },
      addRecentlyViewed: (formulaId: string) => {
        const { recentlyViewed } = get();
        const filtered = recentlyViewed.filter((id) => id !== formulaId);
        set({ recentlyViewed: [formulaId, ...filtered].slice(0, 10) });
      },
      isBookmarked: (formulaId: string) => {
        return get().bookmarks.includes(formulaId);
      },
    }),
    {
      name: 'mathematics-verse-user-storage',
    }
  )
);
