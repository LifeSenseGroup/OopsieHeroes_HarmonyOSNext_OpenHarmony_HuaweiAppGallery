import { webview } from '@kit.ArkWeb';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { abilityAccessCtrl, bundleManager, wantAgent, WantAgent } from '@kit.AbilityKit';
import { fileIo } from '@kit.CoreFileKit';
import { audio } from '@kit.AudioKit';
import { backgroundTaskManager } from '@kit.BackgroundTasksKit';
import media from '@ohos.multimedia.media';
import promptAction from '@ohos.promptAction';
import common from '@ohos.app.ability.common';
import { SensorBeepDetector } from '../manager/SensorBeepDetector';
import { AlarmVolume } from '../prediction/AlarmVolume';

const DOMAIN = 0x0000;
// The shipped web UI offers a three-second parent voice recording.
const VOICE_RECORDING_DURATION_MS = 3000;

@Entry
@Component
struct ActivityOopsieWeb {
  private controller: webview.WebviewController = new webview.WebviewController();
  private ringtonePlayer?: media.AVPlayer;
  private ringtoneStopTimer?: number;
  private ringtoneResourcePath?: string;
  private ringtoneFile?: fileIo.File;
  private recorder?: media.AVRecorder;
  private recordingFile?: fileIo.File;
  private recordingStopTimer?: number;
  private recordingStartTask?: Promise<void>;
  private recordingStopTask?: Promise<void>;
  private recordingInProgress: boolean = false;
  private recordingFailed: boolean = false;
  private soundDetectionRequested: boolean = false;
  private soundCapturer?: audio.AudioCapturer;
  private soundDetectionGeneration: number = 0;
  private soundAlarmTriggered: boolean = false;
  private backgroundRecordingTaskActive: boolean = false;

  build() {
    Column() {
      Web({
        src: $rawfile('oopsie/index.html'),
        controller: this.controller
      })
        .javaScriptProxy({
          object: this,
          name: 'OopsieHarmony',
          methodList: ['requestMicrophonePermission'],
          controller: this.controller,
          asyncMethodList: ['exitApp', 'playSound', 'stopSound', 'startRecording', 'stopRecording', 'startSoundDetection', 'stopSoundDetection']
        })
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .fileAccess(true)
        .imageAccess(true)
        .onPageBegin(() => {
          hilog.info(DOMAIN, 'testTag', '%{public}s', 'Oopsie WebView page load started');
        })
        .onPageEnd(() => {
          hilog.info(DOMAIN, 'testTag', '%{public}s', 'Oopsie WebView page load finished');
        })
        .onErrorReceive((event: OnErrorReceiveEvent) => {
          const errorInfo = event.error.getErrorInfo();
          hilog.error(DOMAIN, 'testTag', 'Oopsie WebView load error: %{public}s', errorInfo);
        })
        .onConsole((event: OnConsoleEvent) => {
          const message = event.message.getMessage();
          hilog.info(DOMAIN, 'testTag', 'Oopsie web console: %{public}s', message);
          return false;
        })
        .width('100%')
        .height('100%')
    }
    .width('100%')
    .height('100%')
  }

  exitApp(): Promise<void> {
    const hostContext = this.getUIContext().getHostContext();
    if (!hostContext) {
      return Promise.resolve();
    }
    return (hostContext as common.UIAbilityContext).terminateSelf();
  }

  requestMicrophonePermission(onResult: (granted: boolean) => void): void {
    const hostContext = this.getUIContext().getHostContext() as common.UIAbilityContext | undefined;
    if (!hostContext) {
      onResult(false);
      return;
    }
    this.requestMicrophonePermissionResult(hostContext)
      .then((granted: boolean) => onResult(granted))
      .catch((error: Error) => {
        hilog.error(DOMAIN, 'testTag', 'Microphone permission request failed: %{public}s', `${error}`);
        onResult(false);
      });
  }

  private async requestMicrophonePermissionResult(hostContext: common.UIAbilityContext): Promise<boolean> {
    const permissionName = 'ohos.permission.MICROPHONE';
    const atManager = abilityAccessCtrl.createAtManager();
    try {
      let status = await this.getMicrophonePermissionStatus(atManager, permissionName);
      if (status === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
        hilog.info(DOMAIN, 'testTag', 'Microphone permission is already granted');
        return true;
      }

      await atManager.requestPermissionsFromUser(hostContext, [permissionName]);
      status = await this.getMicrophonePermissionStatus(atManager, permissionName);
      const granted = status === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED;
      if (!granted) {
        hilog.warn(DOMAIN, 'testTag', 'Microphone permission was not granted');
      }
      return granted;
    } catch (error) {
      hilog.error(DOMAIN, 'testTag', 'Microphone permission request failed: %{public}s', `${error}`);
      return false;
    }
  }

  private async getMicrophonePermissionStatus(atManager: abilityAccessCtrl.AtManager,
    permissionName: 'ohos.permission.MICROPHONE'): Promise<abilityAccessCtrl.GrantStatus> {
    const appInfo = bundleManager.getBundleInfoForSelfSync(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION);
    return await atManager.checkAccessToken(appInfo.appInfo.accessTokenId, permissionName);
  }

  async playSound(fileName: string, durationMs: number, loop: boolean, volumeFraction: number = 1): Promise<void> {
    if (fileName === 'customSnd') {
      // MPEG-4 audio is not playable until stop() has finalized the recording.
      // Also wait when Stop/automatic timeout is already finalizing the file.
      await this.stopRecording();
    }
    await this.stopSound();
    const fraction = Number.isFinite(volumeFraction) ? volumeFraction : 1;
    const hostContext = this.getUIContext().getHostContext() as common.UIAbilityContext | undefined;
    if (!hostContext) {
      return;
    }
    let fd: number;
    let offset: number = 0;
    let length: number;
    if (fileName === 'customSnd') {
      const customPath = `${hostContext.filesDir}/recorded_audio.m4a`;
      try {
        const stat = fileIo.statSync(customPath);
        this.ringtoneFile = fileIo.openSync(customPath, fileIo.OpenMode.READ_ONLY);
        fd = this.ringtoneFile.fd;
        length = stat.size;
      } catch (_) {
        hilog.warn(DOMAIN, 'testTag', 'No custom voice recording is available yet');
        promptAction.showToast({ message: $r('app.string.voice_recording_missing') });
        return;
      }
    } else {
      const resourcePath = `oopsie/build/sounds/${fileName}`;
      const rawFile = await hostContext.resourceManager.getRawFd(resourcePath);
      this.ringtoneResourcePath = resourcePath;
      fd = rawFile.fd;
      offset = rawFile.offset;
      length = rawFile.length;
    }
    const player = await media.createAVPlayer();
    this.ringtonePlayer = player;
    const initialized = this.waitForPlayerState(player, 'initialized');
    player.fdSrc = { fd, offset, length };
    try {
      await initialized;
      // Treat this as an alarm stream so it uses the system alarm volume and focus
      // policy, including when the app is in the background.
      player.audioRendererInfo = {
        usage: audio.StreamUsage.STREAM_USAGE_ALARM,
        rendererFlags: 0
      };
      await player.prepare();
      await AlarmVolume.applyFraction(fraction);
      player.loop = loop;
      await player.play();
      if (durationMs > 0) {
        this.ringtoneStopTimer = setTimeout(() => {
          this.stopSound();
        }, durationMs);
      }
    } catch (error) {
      await this.stopSound();
      hilog.error(DOMAIN, 'testTag', 'Harmony ringtone playback failed: %{public}s', `${error}`);
      throw new Error(`${error}`);
    }
  }

  async stopSound(): Promise<void> {
    if (this.ringtoneStopTimer !== undefined) {
      clearTimeout(this.ringtoneStopTimer);
      this.ringtoneStopTimer = undefined;
    }
    const player = this.ringtonePlayer;
    this.ringtonePlayer = undefined;
    const resourcePath = this.ringtoneResourcePath;
    this.ringtoneResourcePath = undefined;
    const ringtoneFile = this.ringtoneFile;
    this.ringtoneFile = undefined;
    if (player) {
      try {
        if (player.state === 'prepared' || player.state === 'playing' || player.state === 'paused' ||
          player.state === 'completed') {
          await player.stop();
        }
      } catch (_) {
        // The player may already have stopped.
      }
      await player.release();
    }
    if (resourcePath) {
      const hostContext = this.getUIContext().getHostContext() as common.UIAbilityContext | undefined;
      if (hostContext) {
        await hostContext.resourceManager.closeRawFd(resourcePath);
      }
    }
    if (ringtoneFile) {
      fileIo.closeSync(ringtoneFile);
    }
    await AlarmVolume.restore();
  }

  async startRecording(): Promise<void> {
    if (this.recordingStopTask) {
      await this.recordingStopTask;
    }
    if (this.recordingStartTask) {
      await this.recordingStartTask;
      return;
    }
    if (this.recorder) {
      return;
    }
    this.recordingStartTask = this.beginVoiceRecording();
    try {
      await this.recordingStartTask;
    } finally {
      this.recordingStartTask = undefined;
    }
  }

  private async beginVoiceRecording(): Promise<void> {
    const hostContext = this.getUIContext().getHostContext() as common.UIAbilityContext | undefined;
    if (!hostContext) {
      return;
    }
    this.recordingInProgress = true;
    this.recordingFailed = false;
    let outputFile: fileIo.File | undefined;
    let recorder: media.AVRecorder | undefined;
    try {
      if (!await this.requestMicrophonePermissionResult(hostContext)) {
        this.recordingInProgress = false;
        promptAction.showToast({ message: $r('app.string.voice_recording_permission') });
        return;
      }
      await this.stopSound();
      // Sensor listening and voice recording must not compete for the microphone.
      // Remember the requested listening state so it can resume after recording.
      await this.stopSoundDetection(true);
      const outputPath = `${hostContext.filesDir}/recorded_audio_pending.m4a`;
      outputFile = fileIo.openSync(outputPath,
        fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.CREATE | fileIo.OpenMode.TRUNC);
      recorder = await media.createAVRecorder();
      recorder.on('error', (error: Error) => {
        this.recordingFailed = true;
        hilog.error(DOMAIN, 'testTag', 'Voice recorder error: %{public}s', `${error}`);
        void this.stopRecording();
      });
      await recorder.prepare({
        audioSourceType: media.AudioSourceType.AUDIO_SOURCE_TYPE_MIC,
        profile: {
          audioBitrate: 96000,
          audioChannels: 1,
          audioCodec: media.CodecMimeType.AUDIO_AAC,
          audioSampleRate: 44100,
          fileFormat: media.ContainerFormatType.CFT_MPEG_4A
        },
        url: `fd://${outputFile.fd}`
      });
      await recorder.start();
      this.recordingFile = outputFile;
      this.recorder = recorder;
      this.recordingStopTimer = setTimeout(() => {
        void this.stopRecording();
      }, VOICE_RECORDING_DURATION_MS);
    } catch (error) {
      hilog.error(DOMAIN, 'testTag', 'Harmony voice recording failed: %{public}s', `${error}`);
      if (recorder) {
        try {
          await recorder.release();
        } catch (_) {
          // Ignore cleanup errors after a failed recorder start.
        }
      }
      if (outputFile) {
        fileIo.closeSync(outputFile);
      }
      this.recordingInProgress = false;
      promptAction.showToast({ message: $r('app.string.voice_recording_failed') });
      if (this.soundDetectionRequested) {
        await this.startSoundDetection();
      }
    }
  }

  async stopRecording(): Promise<void> {
    if (this.recordingStartTask) {
      await this.recordingStartTask;
    }
    if (!this.recordingStopTask) {
      this.recordingStopTask = this.finishVoiceRecording();
    }
    try {
      await this.recordingStopTask;
    } finally {
      this.recordingStopTask = undefined;
    }
  }

  private async finishVoiceRecording(): Promise<void> {
    if (this.recordingStopTimer !== undefined) {
      clearTimeout(this.recordingStopTimer);
      this.recordingStopTimer = undefined;
    }
    const recorder = this.recorder;
    const outputFile = this.recordingFile;
    this.recorder = undefined;
    this.recordingFile = undefined;
    let saved = false;
    if (recorder) {
      try {
        if (recorder.state === 'started' || recorder.state === 'paused') {
          await recorder.stop();
          saved = !this.recordingFailed;
        }
      } catch (error) {
        hilog.error(DOMAIN, 'testTag', 'Harmony voice recording stop failed: %{public}s', `${error}`);
      }
      try {
        await recorder.release();
      } catch (_) {
        // The recorder may already have released its resources.
      }
    }
    if (outputFile) {
      fileIo.closeSync(outputFile);
    }
    const hostContext = this.getUIContext().getHostContext() as common.UIAbilityContext | undefined;
    if (recorder && hostContext) {
      try {
        const pendingPath = `${hostContext.filesDir}/recorded_audio_pending.m4a`;
        if (!saved || fileIo.statSync(pendingPath).size === 0) {
          throw new Error('Voice recording was not finalized');
        }
        // Keep the previous usable recording if permission or recording fails.
        fileIo.renameSync(pendingPath, `${hostContext.filesDir}/recorded_audio.m4a`);
        hilog.info(DOMAIN, 'testTag', 'Parent voice recording saved');
      } catch (error) {
        hilog.error(DOMAIN, 'testTag', 'Could not save voice recording: %{public}s', `${error}`);
        promptAction.showToast({ message: $r('app.string.voice_recording_failed') });
      }
    }
    this.recordingInProgress = false;
    if (recorder && this.soundDetectionRequested) {
      await this.startSoundDetection();
    }
  }

  async startSoundDetection(): Promise<void> {
    this.soundDetectionRequested = true;
    if (this.recordingInProgress || this.soundCapturer) {
      return;
    }
    const requestGeneration = ++this.soundDetectionGeneration;
    const hostContext = this.getUIContext().getHostContext() as common.UIAbilityContext | undefined;
    if (!hostContext) {
      return;
    }
    try {
      const atManager = abilityAccessCtrl.createAtManager();
      let permissionStatus = await this.getMicrophonePermissionStatus(atManager, 'ohos.permission.MICROPHONE');
      if (permissionStatus !== abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
        await atManager.requestPermissionsFromUser(hostContext, ['ohos.permission.MICROPHONE']);
        permissionStatus = await this.getMicrophonePermissionStatus(atManager, 'ohos.permission.MICROPHONE');
      }
      if (permissionStatus !== abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
        hilog.warn(DOMAIN, 'testTag', 'Microphone permission was not granted; sensor sound detection is off');
        return;
      }
      if (requestGeneration !== this.soundDetectionGeneration) {
        return;
      }
      const capturer = await audio.createAudioCapturer({
        streamInfo: {
          samplingRate: audio.AudioSamplingRate.SAMPLE_RATE_44100,
          channels: audio.AudioChannel.CHANNEL_1,
          sampleFormat: audio.AudioSampleFormat.SAMPLE_FORMAT_S16LE,
          encodingType: audio.AudioEncodingType.ENCODING_TYPE_RAW
        },
        capturerInfo: {
          // Keep the sensor's 4 kHz tone intact for analysis. The generic MIC
          // source may apply voice processing; Android uses VOICE_RECOGNITION
          // with AGC disabled for this same detector.
          source: audio.SourceType.SOURCE_TYPE_UNPROCESSED,
          capturerFlags: 1
        }
      });
      await capturer.start();
      if (requestGeneration !== this.soundDetectionGeneration) {
        await capturer.stop();
        await capturer.release();
        return;
      }

      // Start and confirm the OS continuous recording task while the app is still
      // foregrounded. HarmonyOS can suspend the capturer when the app is backgrounded
      // unless this task is active.
      if (!await this.startBackgroundRecordingTask(hostContext)) {
        await capturer.stop();
        await capturer.release();
        promptAction.showToast({ message: 'Background sensor detection could not start. Keep the app open.' });
        return;
      }
      if (requestGeneration !== this.soundDetectionGeneration) {
        await capturer.stop();
        await capturer.release();
        await this.stopBackgroundRecordingTask(hostContext);
        return;
      }

      this.soundCapturer = capturer;
      this.soundAlarmTriggered = false;
      const bufferSize = await capturer.getBufferSize();
      void this.readSensorSound(capturer, bufferSize, requestGeneration);
      hilog.info(DOMAIN, 'testTag', 'Sensor beep detection and background recording task started');
    } catch (error) {
      hilog.error(DOMAIN, 'testTag', 'Could not start sensor sound detection: %{public}s', `${error}`);
      await this.stopSoundDetection();
    }
  }

  async stopSoundDetection(preserveRequest: boolean = false): Promise<void> {
    if (!preserveRequest) {
      this.soundDetectionRequested = false;
    }
    this.soundDetectionGeneration++;
    const capturer = this.soundCapturer;
    this.soundCapturer = undefined;
    if (capturer) {
      try {
        if (capturer.state === audio.AudioState.STATE_RUNNING || capturer.state === audio.AudioState.STATE_PAUSED) {
          await capturer.stop();
        }
      } catch (_) {
        // Capture may already have stopped after a device or permission change.
      }
      try {
        await capturer.release();
      } catch (_) {
        // The capturer may already have released its resources.
      }
    }
    this.soundAlarmTriggered = false;
    const hostContext = this.getUIContext().getHostContext() as common.UIAbilityContext | undefined;
    if (hostContext) {
      await this.stopBackgroundRecordingTask(hostContext);
    }
  }

  private async startBackgroundRecordingTask(hostContext: common.UIAbilityContext): Promise<boolean> {
    if (this.backgroundRecordingTaskActive) {
      return true;
    }
    try {
      const wantAgentInfo: wantAgent.WantAgentInfo = {
        wants: [
          {
            bundleName: 'com.oopsieheroes.app',
            abilityName: 'EntryAbility'
          }
        ],
        actionType: wantAgent.OperationType.START_ABILITY,
        requestCode: 0,
        actionFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG]
      };
      const notificationAgent: WantAgent = await wantAgent.getWantAgent(wantAgentInfo);
      await backgroundTaskManager.startBackgroundRunning(
        hostContext,
        backgroundTaskManager.BackgroundMode.AUDIO_RECORDING,
        notificationAgent
      );
      this.backgroundRecordingTaskActive = true;
      hilog.info(DOMAIN, 'testTag', 'Background audio recording task started');
      return true;
    } catch (error) {
      hilog.error(DOMAIN, 'testTag', 'Could not start background audio recording task: %{public}s', `${error}`);
      return false;
    }
  }

  private async startBackgroundAlarmTask(hostContext: common.UIAbilityContext): Promise<void> {
    try {
      // Replace the recording-only task with a combined recording + playback task.
      // The microphone capture stream stays active during this handoff.
      if (this.backgroundRecordingTaskActive) {
        await backgroundTaskManager.stopBackgroundRunning(hostContext);
        this.backgroundRecordingTaskActive = false;
      }
      const wantAgentInfo: wantAgent.WantAgentInfo = {
        wants: [
          {
            bundleName: 'com.oopsieheroes.app',
            abilityName: 'EntryAbility'
          }
        ],
        actionType: wantAgent.OperationType.START_ABILITY,
        requestCode: 0,
        actionFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG]
      };
      const notificationAgent: WantAgent = await wantAgent.getWantAgent(wantAgentInfo);
      await backgroundTaskManager.startBackgroundRunning(
        hostContext,
        ['audioRecording', 'audioPlayback'],
        notificationAgent
      );
      this.backgroundRecordingTaskActive = true;
      hilog.info(DOMAIN, 'testTag', 'Background recording and alarm playback task started');
    } catch (error) {
      hilog.error(DOMAIN, 'testTag', 'Could not enable background alarm playback task: %{public}s', `${error}`);
      // Preserve sensor monitoring if the OS rejects the combined task request.
      if (!this.backgroundRecordingTaskActive) {
        await this.startBackgroundRecordingTask(hostContext);
      }
    }
  }

  private async stopBackgroundRecordingTask(hostContext: common.UIAbilityContext): Promise<void> {
    if (!this.backgroundRecordingTaskActive) {
      return;
    }
    try {
      await backgroundTaskManager.stopBackgroundRunning(hostContext);
      hilog.info(DOMAIN, 'testTag', 'Background audio recording task stopped');
    } catch (error) {
      hilog.error(DOMAIN, 'testTag', 'Could not stop background audio recording task: %{public}s', `${error}`);
    } finally {
      this.backgroundRecordingTaskActive = false;
    }
  }

  private async readSensorSound(capturer: audio.AudioCapturer, bufferSize: number, generation: number): Promise<void> {
    const detector = new SensorBeepDetector();
    try {
      while (this.soundCapturer === capturer && this.soundDetectionGeneration === generation &&
        capturer.state === audio.AudioState.STATE_RUNNING) {
        const buffer = await capturer.read(bufferSize, true);
        if (AlarmVolume.isQuietPhase()) {
          continue;
        }
        if (!this.soundAlarmTriggered && detector.process(buffer)) {
          this.soundAlarmTriggered = true;
          hilog.info(DOMAIN, 'testTag', 'Sensor 4 kHz beep pattern detected');
          // Upgrade the recording task before asking the WebView to start alarm audio.
          const hostContext = this.getUIContext().getHostContext() as common.UIAbilityContext | undefined;
          if (hostContext) {
            await this.startBackgroundAlarmTask(hostContext);
          }
          const alarmTrigger = this.controller.runJavaScript('window.AlarmTriggered && window.AlarmTriggered()')
            .catch((error: Error) => {
              hilog.error(DOMAIN, 'testTag', 'Could not deliver sensor alarm to WebView: %{public}s', `${error}`);
            });
          await alarmTrigger;
        }
      }
    } catch (error) {
      if (this.soundCapturer === capturer && this.soundDetectionGeneration === generation) {
        hilog.error(DOMAIN, 'testTag', 'Sensor sound monitoring stopped: %{public}s', `${error}`);
        await this.stopSoundDetection();
      }
    }
  }

  private waitForPlayerState(player: media.AVPlayer, expectedState: media.AVPlayerState): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const stateChange = (state: media.AVPlayerState): void => {
        if (state === expectedState) {
          player.off('stateChange', stateChange);
          resolve();
        } else if (state === 'error' || state === 'released') {
          player.off('stateChange', stateChange);
          reject(new Error(`AVPlayer changed to ${state} before ${expectedState}`));
        }
      };
      player.on('stateChange', stateChange);
    });
  }
}
