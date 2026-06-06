/* src/store/portal-store.ts
   Zustand store for the OrcaBot client portal.
   Manages active tab and admin-mode toggle state.
   Persisted to localStorage so the user's tab is remembered between visits.
*/
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type PortalTab = 'profile' | 'knowledge' | 'cbots';

interface PortalState {
  activeTab:     PortalTab;
  isAdminMode:   boolean;
  setActiveTab:  (tab: PortalTab) => void;
  toggleAdmin:   () => void;
  setAdminMode:  (on: boolean) => void;
}

export const usePortalStore = create<PortalState>()(
  persist(
    (set) => ({
      activeTab:    'knowledge',
      isAdminMode:  false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleAdmin:  ()    => set((s) => ({ isAdminMode: !s.isAdminMode })),
      setAdminMode: (on)  => set({ isAdminMode: on }),
    }),
    {
      name:    'portal-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
