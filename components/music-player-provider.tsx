import { setAudioModeAsync, useAudioPlaylist, useAudioPlaylistStatus } from 'expo-audio';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';

import { useMusicStore } from '@/store/use-music-store';

type MusicPlayerContextValue = {
  currentIndex: number;
  currentTime: number;
  duration: number;
  playing: boolean;
  buffering: boolean;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  playTrack: (index: number) => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: PropsWithChildren) {
  const tracks = useMusicStore((state) => state.tracks);
  const sources = useMemo(
    () => tracks.map((track) => ({ uri: track.uri, name: track.title })),
    [tracks],
  );
  const playlist = useAudioPlaylist({ sources, loop: 'all', updateInterval: 500 });
  const status = useAudioPlaylistStatus(playlist);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  const value: MusicPlayerContextValue = {
    currentIndex: status.currentIndex,
    currentTime: status.currentTime,
    duration: status.duration,
    playing: status.playing,
    buffering: status.isBuffering,
    play: () => playlist.play(),
    pause: () => playlist.pause(),
    next: () => playlist.next(),
    previous: () => playlist.previous(),
    playTrack: (index) => { playlist.skipTo(index); playlist.play(); },
  };

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>;
}

export function useMusicPlayer() {
  const value = useContext(MusicPlayerContext);
  if (!value) throw new Error('useMusicPlayer must be used inside MusicPlayerProvider.');
  return value;
}
