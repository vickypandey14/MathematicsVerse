'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/store/useUserStore';

export default function RecentTracker({ formulaId }: { formulaId: string }) {
  const { addRecentlyViewed } = useUserStore();

  useEffect(() => {
    addRecentlyViewed(formulaId);
  }, [formulaId, addRecentlyViewed]);

  return null;
}
