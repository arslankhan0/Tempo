import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMusicPlayer } from '@/components/music-player-provider';
import { useAppTheme } from '@/hooks/use-app-theme';
import { deleteLocalMusicFile, pickLocalMp3Files } from '@/lib/music-files';
import { useMusicStore } from '@/store/use-music-store';

export default function MusicScreen() {
  const { isDark } = useAppTheme();
  const tracks = useMusicStore((state) => state.tracks);
  const addTracks = useMusicStore((state) => state.addTracks);
  const removeTrack = useMusicStore((state) => state.removeTrack);
  const player = useMusicPlayer();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function importMusic() {
    setBusy(true);
    setMessage('');
    try {
      const selected = await pickLocalMp3Files();
      addTracks(selected);
      if (selected.length) setMessage(`${selected.length} track${selected.length === 1 ? '' : 's'} added.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not import music.');
    } finally {
      setBusy(false);
    }
  }

  function remove(id: string, uri: string) {
    player.pause();
    try { deleteLocalMusicFile(uri); } catch { /* The missing file can still be removed from the playlist. */ }
    removeTrack(id);
  }

  const currentTrack = tracks[player.currentIndex];
  const progress = player.duration > 0 ? Math.min(player.currentTime / player.duration, 1) : 0;

  function formatAudioTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0B1929' : '#F4F6F8' }}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }}>
        <View className="w-full max-w-md self-center">
          <View className="mb-7 flex-row items-center justify-between pt-2">
            <Pressable accessibilityLabel="Go back" onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#132338]"><Feather name="chevron-left" size={21} color={isDark ? 'white' : '#102033'} /></Pressable>
            <Text className="text-lg font-bold text-[#102033] dark:text-white">Focus music</Text>
            <Pressable accessibilityLabel="Add MP3 files" disabled={busy} onPress={importMusic} className="h-11 w-11 items-center justify-center rounded-full bg-[#FF6B1A] disabled:opacity-50"><Feather name="plus" size={21} color="white" /></Pressable>
          </View>

          <View className="mb-5 rounded-3xl bg-[#10245A] p-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#83A9FF]">Playlist</Text>
            <Text numberOfLines={1} className="mt-2 text-2xl font-bold text-white">{currentTrack?.title ?? (tracks.length ? 'Ready to play' : 'Add your music')}</Text>
            <Text className="mt-2 text-sm text-[#B8CBF8]">{player.buffering ? 'Loading…' : tracks.length ? `${tracks.length} local track${tracks.length === 1 ? '' : 's'}` : 'MP3 files stay on this device.'}</Text>
            <View className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20"><View className="h-1.5 rounded-full bg-[#42C9F5]" style={{ width: `${progress * 100}%` }} /></View>
            <View className="mt-2 flex-row justify-between"><Text className="text-xs text-[#B8CBF8]">{formatAudioTime(player.currentTime)}</Text><Text className="text-xs text-[#B8CBF8]">{formatAudioTime(player.duration)}</Text></View>
            <View className="mt-4 flex-row items-center justify-center gap-7">
              <Pressable accessibilityLabel="Previous track" disabled={!tracks.length} onPress={player.previous} className="h-11 w-11 items-center justify-center disabled:opacity-40"><Feather name="skip-back" size={22} color="white" /></Pressable>
              <Pressable accessibilityLabel={player.playing ? 'Pause music' : 'Play music'} disabled={!tracks.length} onPress={player.playing ? player.pause : player.play} className="h-16 w-16 items-center justify-center rounded-full bg-[#FF6B1A] disabled:opacity-40"><Feather name={player.playing ? 'pause' : 'play'} size={26} color="white" /></Pressable>
              <Pressable accessibilityLabel="Next track" disabled={!tracks.length} onPress={player.next} className="h-11 w-11 items-center justify-center disabled:opacity-40"><Feather name="skip-forward" size={22} color="white" /></Pressable>
            </View>
          </View>

          {message ? <Text accessibilityRole="alert" className="mb-4 text-center text-sm text-[#526276] dark:text-[#8B9CAF]">{message}</Text> : null}
          <View className="gap-3">
            {tracks.map((track, index) => (
              <View key={track.id} className={`min-h-16 flex-row items-center rounded-2xl border px-3 ${player.currentIndex === index ? 'border-[#2F7BFF] bg-[#EAF1FF] dark:bg-[#10245A]' : 'border-[#DDE4EA] bg-white dark:border-[#1B2D42] dark:bg-[#0D1724]'}`}>
                <Pressable accessibilityLabel={`Play ${track.title}`} onPress={() => player.playTrack(index)} className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1FF] dark:bg-[#10245A]"><Feather name={player.currentIndex === index && player.playing ? 'volume-2' : 'play'} size={18} color="#2F7BFF" /></Pressable>
                <View className="flex-1"><Text numberOfLines={1} className="font-semibold text-[#102033] dark:text-white">{track.title}</Text><Text className="mt-1 text-xs text-[#738294]">Track {index + 1}</Text></View>
                <Pressable accessibilityLabel={`Remove ${track.title}`} onPress={() => remove(track.id, track.uri)} className="h-11 w-11 items-center justify-center"><Feather name="trash-2" size={17} color="#D94B38" /></Pressable>
              </View>
            ))}
          </View>
          {!tracks.length ? <Pressable disabled={busy} onPress={importMusic} className="min-h-36 items-center justify-center rounded-3xl border border-dashed border-[#C9D3DC] dark:border-[#2A3D52]"><Feather name="music" size={24} color="#FF6B1A" /><Text className="mt-3 font-semibold text-[#102033] dark:text-white">{busy ? 'Opening files…' : 'Choose MP3 files'}</Text></Pressable> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
