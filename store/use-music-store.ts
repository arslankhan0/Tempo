import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { MusicTrack } from '@/types/music';

type MusicStore = {
  tracks: MusicTrack[];
  addTracks: (tracks: MusicTrack[]) => void;
  removeTrack: (id: string) => void;
};

export const useMusicStore = create<MusicStore>()(
  persist(
    (set) => ({
      tracks: [],
      addTracks: (tracks) => set((state) => ({
        tracks: [...state.tracks, ...tracks.filter((track) => !state.tracks.some((item) => item.uri === track.uri))],
      })),
      removeTrack: (id) => set((state) => ({ tracks: state.tracks.filter((track) => track.id !== id) })),
    }),
    {
      name: 'tempo-music',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ tracks }) => ({ tracks }),
    },
  ),
);
