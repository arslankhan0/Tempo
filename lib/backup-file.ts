import * as DocumentPicker from 'expo-document-picker';
import { File as ExpoFile, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { createBackupFile, parseBackupFile, type BackupData } from './backup';

const maxBackupBytes = 5 * 1024 * 1024;

function downloadOnWeb(contents: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function writeLocalDataFile(data: BackupData) {
  if (Platform.OS === 'web') return;
  const file = new ExpoFile(Paths.document, 'tempo-data.json');
  file.create({ overwrite: true, intermediates: true });
  file.write(createBackupFile(data));
}

export function readLocalDataFile(): BackupData | null {
  if (Platform.OS === 'web') return null;
  const file = new ExpoFile(Paths.document, 'tempo-data.json');
  if (!file.exists) return null;
  return parseBackupFile(file.textSync());
}

export async function exportBackupFile(data: BackupData) {
  const contents = createBackupFile(data);
  const fileName = `tempo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  if (Platform.OS === 'web') {
    downloadOnWeb(contents, fileName);
    return;
  }
  const file = new ExpoFile(Paths.cache, fileName);
  file.create({ overwrite: true, intermediates: true });
  file.write(contents);
  if (!await Sharing.isAvailableAsync()) throw new Error('File sharing is unavailable on this device.');
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Export Tempo data',
  });
}

export async function pickBackupFile(): Promise<BackupData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (asset.size && asset.size > maxBackupBytes) throw new Error('The selected file is too large.');
  const contents = Platform.OS === 'web' && asset.file
    ? await asset.file.text()
    : await new ExpoFile(asset.uri).text();
  return parseBackupFile(contents);
}
