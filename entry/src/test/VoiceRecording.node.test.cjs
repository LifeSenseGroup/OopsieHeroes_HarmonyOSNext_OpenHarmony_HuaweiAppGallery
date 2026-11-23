// Host regression checks for the native WebView bridge. Audio/permission APIs are
// simulated here; actual microphone capture still requires a HarmonyOS device.
// Run from the project root: node --test entry/src/test/VoiceRecording.node.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../../../webapp/node_modules/typescript');

const pagePath = path.join(__dirname, '../main/ets/pages/activity_oopsie_web.ets');
const source = fs.readFileSync(pagePath, 'utf8')
  .replace(/^import .*;\r?\n/gm, '')
  .replace('@Entry', '')
  .replace('@Component', '')
  .replace('struct ActivityOopsieWeb', 'class ActivityOopsieWeb')
  .replace(/  build\(\) \{[\s\S]*?(?=  exitApp\()/, '');
const compiled = ts.transpileModule(source + '\nglobalThis.Page = ActivityOopsieWeb;', {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
}).outputText;

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function setup({ granted = true, prepareFails = false, stopGate, permissionGate } = {}) {
  const calls = [];
  const files = new Map([['/files/recorded_audio.m4a', 'previous voice']]);
  const timers = new Map();
  const descriptors = new Map();
  const toasts = [];
  let nextFd = 1;
  let recorderCreations = 0;
  let detectionResumes = 0;
  const player = {
    state: 'idle',
    set fdSrc(value) { this.state = 'initialized'; calls.push('player.source'); },
    async prepare() { this.state = 'prepared'; },
    async play() { calls.push('player.play'); this.state = 'playing'; },
    async stop() {},
    async release() {}
  };
  const recorder = {
    state: 'idle',
    on() {},
    async prepare() {
      if (prepareFails) throw new Error('Microphone unavailable');
      this.state = 'prepared';
    },
    async start() { calls.push('recorder.start'); this.state = 'started'; },
    async stop() {
      calls.push('recorder.stop');
      if (stopGate) await stopGate.promise;
      files.set('/files/recorded_audio_pending.m4a', 'new voice');
      this.state = 'stopped';
    },
    async release() { calls.push('recorder.release'); this.state = 'released'; }
  };
  const context = vm.createContext({
    webview: { WebviewController: class {} },
    hilog: { info() {}, warn() {}, error() {} },
    promptAction: { showToast({ message }) { toasts.push(message); } },
    $r: (name) => name,
    media: {
      async createAVRecorder() { recorderCreations++; return recorder; },
      async createAVPlayer() { return player; },
      AudioSourceType: { AUDIO_SOURCE_TYPE_MIC: 0 },
      CodecMimeType: { AUDIO_AAC: 'aac' },
      ContainerFormatType: { CFT_MPEG_4A: 'm4a' }
    },
    audio: {
      StreamUsage: { STREAM_USAGE_ALARM: 4 },
      AudioState: { STATE_RUNNING: 'running', STATE_PAUSED: 'paused' }
    },
    fileIo: {
      OpenMode: { READ_WRITE: 1, CREATE: 2, TRUNC: 4, READ_ONLY: 0 },
      openSync(name, flags) {
        if (flags !== 0) files.set(name, '');
        if (!files.has(name)) throw new Error('File missing');
        descriptors.set(nextFd, name);
        return { fd: nextFd++ };
      },
      closeSync(file) { descriptors.delete(file.fd); calls.push('file.close'); },
      statSync(name) {
        if (!files.has(name)) throw new Error('File missing');
        return { size: files.get(name).length };
      },
      renameSync(from, to) {
        assert.ok(!Array.from(descriptors.values()).includes(from), 'close the recording before committing');
        files.set(to, files.get(from));
        files.delete(from);
        calls.push('file.commit');
      }
    },
    AlarmVolume: { async restore() {}, async applyFraction() {} },
    setTimeout(callback, delay) { const id = timers.size + 1; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  vm.runInContext(compiled, context);
  const page = new context.Page();
  page.getUIContext = () => ({ getHostContext: () => ({ filesDir: '/files' }) });
  page.requestMicrophonePermissionResult = async () => {
    if (permissionGate) await permissionGate.promise;
    return granted;
  };
  page.waitForPlayerState = async () => {};
  page.stopBackgroundRecordingTask = async () => {};
  const startDetection = page.startSoundDetection.bind(page);
  page.startSoundDetection = async () => {
    if (page.recordingInProgress) return startDetection();
    detectionResumes++;
    page.soundDetectionRequested = true;
  };
  return { page, files, calls, timers, toasts,
    recorderCreations: () => recorderCreations, detectionResumes: () => detectionResumes };
}

test('recording timeout matches the three-second UI and finalizes a new voice', async () => {
  const { page, timers, files } = setup();
  await page.startRecording();
  assert.equal(Array.from(timers.values())[0].delay, 3000);
  assert.equal(files.get('/files/recorded_audio.m4a'), 'previous voice');
  await page.stopRecording();
  assert.equal(files.get('/files/recorded_audio.m4a'), 'new voice');
  assert.equal(timers.size, 0);
});

test('preview waits for an already-running stop to finalize and close the file', async () => {
  const stopGate = deferred();
  const { page, calls } = setup({ stopGate });
  await page.startRecording();
  const stopping = page.stopRecording();
  const preview = page.playSound('customSnd', 0, false);
  await Promise.resolve();
  assert.ok(!calls.includes('player.source'));
  stopGate.resolve();
  await Promise.all([stopping, preview]);
  assert.equal(calls.filter((call) => call === 'recorder.stop').length, 1);
  assert.ok(calls.indexOf('file.commit') < calls.indexOf('player.source'));
  assert.ok(calls.includes('player.play'));
});

test('preview also waits when the microphone permission dialog is still open', async () => {
  const permissionGate = deferred();
  const { page, calls } = setup({ permissionGate });
  const starting = page.startRecording();
  const preview = page.playSound('customSnd', 0, false);
  await Promise.resolve();
  assert.ok(!calls.includes('player.source'));
  permissionGate.resolve();
  await Promise.all([starting, preview]);
  assert.ok(calls.indexOf('recorder.start') < calls.indexOf('recorder.stop'));
  assert.ok(calls.indexOf('file.commit') < calls.indexOf('player.play'));
});

test('denied permission preserves the previous voice and gives user feedback', async () => {
  const state = setup({ granted: false });
  await state.page.startRecording();
  assert.equal(state.recorderCreations(), 0);
  assert.equal(state.files.get('/files/recorded_audio.m4a'), 'previous voice');
  assert.ok(state.toasts.includes('app.string.voice_recording_permission'));
});

test('a recorder failure preserves the previous voice and resumes sensor listening', async () => {
  const state = setup({ prepareFails: true });
  state.page.soundDetectionRequested = true;
  await state.page.startRecording();
  assert.equal(state.files.get('/files/recorded_audio.m4a'), 'previous voice');
  assert.equal(state.detectionResumes(), 1);
  assert.ok(state.toasts.includes('app.string.voice_recording_failed'));
});

test('sensor microphone is released before recording and listening resumes afterwards', async () => {
  const state = setup();
  state.page.soundDetectionRequested = true;
  state.page.soundCapturer = {
    state: 'running',
    async stop() { state.calls.push('detector.stop'); },
    async release() { state.calls.push('detector.release'); }
  };
  await state.page.startRecording();
  assert.ok(state.calls.indexOf('detector.release') < state.calls.indexOf('recorder.start'));
  await state.page.startSoundDetection();
  assert.equal(state.detectionResumes(), 0, 'do not start a competing microphone during voice capture');
  await state.page.stopRecording();
  assert.equal(state.detectionResumes(), 1);
});

test('stopping sensor monitoring during a voice recording prevents unwanted restart', async () => {
  const state = setup();
  state.page.soundDetectionRequested = true;
  await state.page.startRecording();
  await state.page.stopSoundDetection();
  await state.page.stopRecording();
  assert.equal(state.detectionResumes(), 0);
});

test('repeated Record taps while the previous file is closing start only one new recorder', async () => {
  const stopGate = deferred();
  const state = setup({ stopGate });
  await state.page.startRecording();
  const stopping = state.page.stopRecording();
  const startingA = state.page.startRecording();
  const startingB = state.page.startRecording();
  stopGate.resolve();
  await Promise.all([stopping, startingA, startingB]);
  assert.equal(state.recorderCreations(), 2);
  await state.page.stopRecording();
});
