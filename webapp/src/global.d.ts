/// <reference types="svelte" />

interface Window {
  OopsieHarmony?: {
    exitApp: () => void | Promise<void>;
  };
}
