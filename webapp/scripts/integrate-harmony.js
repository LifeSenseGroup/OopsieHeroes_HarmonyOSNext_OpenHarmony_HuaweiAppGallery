const fs = require('node:fs');
const path = require('node:path');

const webappRoot = path.resolve(__dirname, '..');
const imageSource = path.join(webappRoot, 'src', 'images');
const buildRoot = path.join(webappRoot, 'dist', 'build');
const harmonyRoot = path.resolve(webappRoot, '..', 'entry', 'src', 'main', 'resources', 'rawfile', 'oopsie');

// The app references images in nested folders such as build/images/backgrounds.
fs.cpSync(imageSource, path.join(buildRoot, 'images'), { recursive: true });

// Keep HarmonyOS's packaged WebView content in sync with every production build.
fs.mkdirSync(harmonyRoot, { recursive: true });
fs.cpSync(path.join(webappRoot, 'dist'), harmonyRoot, { recursive: true, force: true });

console.log(`Integrated webapp into ${harmonyRoot}`);
