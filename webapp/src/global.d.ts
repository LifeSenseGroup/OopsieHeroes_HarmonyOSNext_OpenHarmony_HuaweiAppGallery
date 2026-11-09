/// <reference types="svelte" />

interface Window {
  OopsieHarmony?: {
    exitApp: () => void | Promise<void>;
    requestMicrophonePermission: (onResult: (granted: boolean) => void) => void;
  };
}
