import { webview } from '@kit.ArkWeb';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { abilityAccessCtrl } from '@kit.AbilityKit';
import { fileIo } from '@kit.CoreFileKit';
import { audio } from '@kit.AudioKit';
import media from '@ohos.multimedia.media';
import common from '@ohos.app.ability.common';
import { SensorBeepDetector } from '../manager/SensorBeepDetector';

const DOMAIN = 0x0000;

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
  private soundCapturer?: audio.AudioCapturer;
  private soundDetectionGeneration: number = 0;

  build() {
    Column() {
      Web({
        src: $rawfile('oopsie/index.html'),
        controller: this.controller
      })
        .javaScriptProxy({
          object: this,
          name: 'OopsieHarmony',
          methodList: ['exitApp', 'playSound', 'stopSound', 'startRecording', 'stopRecording', 'startSoundDetection', 'stopSoundDetection'],
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
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
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

  async playSound(fileName: string, durationMs: number, loop: boolean): Promise<void> {
    await this.stopSound();
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
      await player.prepare();
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
  }

  async startRecording(): Promise<void> {
    if (this.recorder) {
      await this.stopRecording();
    }
    const hostContext = this.getUIContext().getHostContext() as common.UIAbilityContext | undefined;
    if (!hostContext) {
      return;
    }
    let outputFile: fileIo.File | undefined;
    let recorder: media.AVRecorder | undefined;
    try {
      const permission = await abilityAccessCtrl.createAtManager()
        .requestPermissionsFromUser(hostContext, ['ohos.permission.MICROPHONE']);
      if (permission.authResults.length === 0 || permission.authResults[0] !== 0) {
        hilog.warn(DOMAIN, 'testTag', 'Microphone permission was not granted');
        return;
      }
      const outputPath = `${hostContext.filesDir}/recorded_audio.m4a`;
      outputFile = fileIo.openSync(outputPath,
        fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.CREATE | fileIo.OpenMode.TRUNC);
      recorder = await media.createAVRecorder();
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
        this.stopRecording();
      }, 3000);
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
    }
  }

  async stopRecording(): Promise<void> {
    if (this.recordingStopTimer !== undefined) {
      clearTimeout(this.recordingStopTimer);
      this.recordingStopTimer = undefined;
    }
    const recorder = this.recorder;
    const outputFile = this.recordingFile;
    this.recorder = undefined;
    this.recordingFile = undefined;
    if (recorder) {
      try {
        if (recorder.state === 'started' || recorder.state === 'paused') {
          await recorder.stop();
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
  }

  async startSoundDetection(): Promise<void> {
    if (this.soundCapturer) {
      return;
    }
    const requestGeneration = ++this.soundDetectionGeneration;
    const hostContext = this.getUIContext().getHostContext() as common.UIAbilityContext | undefined;
    if (!hostContext) {
      return;
    }
    try {
      const permission = await abilityAccessCtrl.createAtManager()
        .requestPermissionsFromUser(hostContext, ['ohos.permission.MICROPHONE']);
      if (permission.authResults.length === 0 || permission.authResults[0] !== 0) {
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
          source: audio.SourceType.SOURCE_TYPE_MIC,
          capturerFlags: 1
        }
      });
      await capturer.start();
      if (requestGeneration !== this.soundDetectionGeneration) {
        await capturer.stop();
        await capturer.release();
        return;
      }
      this.soundCapturer = capturer;
      const bufferSize = await capturer.getBufferSize();
      void this.readSensorSound(capturer, bufferSize, requestGeneration);
      hilog.info(DOMAIN, 'testTag', 'Sensor beep detection started');
    } catch (error) {
      hilog.error(DOMAIN, 'testTag', 'Could not start sensor sound detection: %{public}s', `${error}`);
      await this.stopSoundDetection();
    }
  }

  async stopSoundDetection(): Promise<void> {
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
  }

  private async readSensorSound(capturer: audio.AudioCapturer, bufferSize: number, generation: number): Promise<void> {
    const detector = new SensorBeepDetector();
    try {
      while (this.soundCapturer === capturer && this.soundDetectionGeneration === generation &&
        capturer.state === audio.AudioState.STATE_RUNNING) {
        const buffer = await capturer.read(bufferSize, true);
        if (detector.process(buffer)) {
          hilog.info(DOMAIN, 'testTag', 'Sensor 4 kHz beep pattern detected');
          await this.stopSoundDetection();
          await this.controller.runJavaScript('window.AlarmTriggered && window.AlarmTriggered()');
          return;
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
