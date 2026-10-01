import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { createId } from './timer';
import type { MusicTrack } from '../types/music';

function cleanFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function titleFromFile(name: string) {
  return name.replace(/\.mp3$/i, '').replace(/[-_]+/g, ' ').trim() || 'Untitled track';
}

export async function pickLocalMp3Files(): Promise<MusicTrack[]> {
  if (Platform.OS === 'web') throw new Error('Local playlists are available in the mobile app.');
  const result = await File.pickFileAsync({
    mimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/*'],
    multipleFiles: true,
  });
  if (result.canceled) return [];

  const musicDirectory = new Directory(Paths.document, 'music');
  musicDirectory.create({ intermediates: true, idempotent: true });
  const imported: MusicTrack[] = [];

  for (const source of result.result) {
    const extension = source.name.toLowerCase().endsWith('.mp3') ? '.mp3' : '';
    if (!extension && source.type !== 'audio/mpeg' && source.type !== 'audio/mp3') continue;
    const id = createId();
    const target = new File(musicDirectory, `${id}-${cleanFileName(source.name)}`);
    await source.copy(target, { overwrite: false });
    imported.push({ id, title: titleFromFile(source.name), uri: target.uri, createdAt: Date.now() });
  }
  if (!imported.length) throw new Error('Choose one or more MP3 files.');
  return imported;
}

export function deleteLocalMusicFile(uri: string) {
  const file = new File(uri);
  if (file.exists) file.delete();
}
