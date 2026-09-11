import type { AlarmSound } from '@/types/alarm';

function safeFileName(name: string | null | undefined, fallbackExt = 'mp3'): string {
  const trimmed = name?.trim();
  if (!trimmed) return `alarm-${Date.now()}.${fallbackExt}`;
  if (trimmed.includes('.')) return trimmed.replace(/[^\w.\-() ]+/g, '_');
  return `${trimmed.replace(/[^\w.\-() ]+/g, '_')}.${fallbackExt}`;
}

function extensionFromMime(mime: string | null | undefined): string {
  switch (mime) {
    case 'audio/mpeg':
    case 'audio/mp3':
      return 'mp3';
    case 'audio/wav':
    case 'audio/x-wav':
      return 'wav';
    case 'audio/ogg':
      return 'ogg';
    case 'audio/aac':
      return 'aac';
    case 'audio/flac':
      return 'flac';
    case 'audio/mp4':
    case 'audio/m4a':
      return 'm4a';
    default:
      return 'mp3';
  }
}

export async function pickCustomAlarmSound(): Promise<AlarmSound | null> {
  const { pick, keepLocalCopy, types, errorCodes, isErrorWithCode } =
    await import('@react-native-documents/picker');

  try {
    const [file] = await pick({
      type: [types.audio],
      allowMultiSelection: false,
      mode: 'import',
    });

    if (!file?.uri) return null;

    const ext = extensionFromMime(file.type);
    const fileName = safeFileName(file.name, ext);
    const fileToCopy: {
      uri: string;
      fileName: string;
      convertVirtualFileToType?: string;
    } = {
      uri: file.uri,
      fileName,
    };

    if (file.isVirtual && file.convertibleToMimeTypes?.length) {
      fileToCopy.convertVirtualFileToType =
        file.convertibleToMimeTypes[0]?.mimeType ?? 'audio/mpeg';
    }

    const [copyResult] = await keepLocalCopy({
      files: [fileToCopy],
      destination: 'documentDirectory',
    });

    if (copyResult.status === 'error') {
      throw new Error(copyResult.copyError || 'Could not copy the selected audio file.');
    }

    return {
      kind: 'custom',
      uri: copyResult.localUri,
      displayName: file.name?.trim() || fileName,
    };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw error;
  }
}
