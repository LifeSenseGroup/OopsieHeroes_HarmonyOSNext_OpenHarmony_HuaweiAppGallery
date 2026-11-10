/// <reference types="svelte" />

interface Window {
  OopsieHarmony?: {
    exitApp: () => void | Promise<void>;
    requestMicrophonePermission: (onResult: (granted: boolean) => void) => void;
    playSound: (fileName: string, durationMs: number, loop: boolean, volume?: number) => void | Promise<void>;
    stopSound: () => void | Promise<void>;
  };
}
