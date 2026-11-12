// Synthetic review aid, not a recording of physical Oopsie Heroes hardware.
// Run from any directory: node scripts/generate-review-sensor-tone.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('../webapp/node_modules/typescript');

const root = path.join(__dirname, '..');
const sampleRate = 44100;
const durationSeconds = 8;
const frequencyHz = 4096;
const pcm = Buffer.alloc(sampleRate * durationSeconds * 2);
for (let sample = 0; sample < sampleRate * durationSeconds; sample++) {
  const second = sample / sampleRate;
  const pulse = second >= 1 && second < 2 || second >= 3 && second < 4 || second >= 5 && second < 6;
  const value = pulse ? Math.round(0.25 * 32767 * Math.sin(2 * Math.PI * frequencyHz * second)) : 0;
  pcm.writeInt16LE(value, sample * 2);
}

// Validate against the shipping native algorithm before offering the sample.
const detectorSource = fs.readFileSync(path.join(root,
  'entry/src/main/ets/manager/SensorBeepDetector.ts'), 'utf8');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(detectorSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText, context);
const detector = new context.exports.SensorBeepDetector();
let detected = false;
for (let offset = 0; offset < pcm.length; offset += 4096) {
  const chunk = pcm.subarray(offset, Math.min(offset + 4096, pcm.length));
  detected = detector.process(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength)) || detected;
}
assert.ok(detected, 'The current sensor detector must recognize the synthetic PCM pattern');

const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(pcm.length, 40);
const output = path.join(root, 'docs/review-assets/sensor-test.wav');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.concat([header, pcm]));
console.log(`Created ${output}: ${durationSeconds}s, ${frequencyHz}Hz pulses, detector check passed.`);
