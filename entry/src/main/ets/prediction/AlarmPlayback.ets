import { audio } from '@kit.AudioKit';
import media from '@ohos.multimedia.media';
import common from '@ohos.app.ability.common';
import { AlarmVolume } from './AlarmVolume';

const ALARM_FILE = 'oopsie/build/sounds/alarmsound1.mp3';

/** Plays the existing bundled alarm at a fraction of the phone alarm maximum. */
export class AlarmPlayback {
  private static player?: media.AVPlayer;
  private static resourcePath?: string;
  private static stopTimer?: number;
  private static host: common.UIAbilityContext | null = null;

  static bind(context: common.UIAbilityContext): void {
    AlarmPlayback.host = context;
  }

  static async play(volume: number, durationMs: number, loop: boolean): Promise<void> {
    const context = AlarmPlayback.host;
    await AlarmPlayback.stop();
    if (!context) {
      return;
    }
    let fd: number = 0;
    let offset: number = 0;
    let length: number = 0;
    try {
      const rawFile = await context.resourceManager.getRawFd(ALARM_FILE);
      fd = rawFile.fd;
      offset = rawFile.offset;
      length = rawFile.length;
    } catch (error) {
      console.error('AlarmPlayback: alarm file is missing ' + JSON.stringify(error));
      return;
    }
    AlarmPlayback.resourcePath = ALARM_FILE;
    const player = await media.createAVPlayer();
    AlarmPlayback.player = player;
    const initialized = AlarmPlayback.waitFor(player, 'initialized');
    const fileSource: media.AVFileDescriptor = { fd: fd, offset: offset, length: length };
    player.fdSrc = fileSource;
    try {
      await initialized;
      const rendererInfo: audio.AudioRendererInfo = {
        usage: audio.StreamUsage.STREAM_USAGE_ALARM,
        rendererFlags: 0
      };
      player.audioRendererInfo = rendererInfo;
      await player.prepare();
      await AlarmVolume.applyFraction(volume);
      player.loop = loop;
      await player.play();
      if (durationMs > 0) {
        AlarmPlayback.stopTimer = setTimeout(() => {
          void AlarmPlayback.stop();
        }, durationMs);
      }
    } catch (error) {
      await AlarmPlayback.stop();
      console.error('AlarmPlayback: playback failed ' + JSON.stringify(error));
    }
  }

  static async stop(): Promise<void> {
    if (AlarmPlayback.stopTimer !== undefined) {
      clearTimeout(AlarmPlayback.stopTimer);
      AlarmPlayback.stopTimer = undefined;
    }
    const player = AlarmPlayback.player;
    AlarmPlayback.player = undefined;
    const resourcePath = AlarmPlayback.resourcePath;
    AlarmPlayback.resourcePath = undefined;
    if (player) {
      try {
        if (player.state === 'prepared' || player.state === 'playing' || player.state === 'paused' ||
          player.state === 'completed') {
          await player.stop();
        }
      } catch (_err) {
        // The player may already have stopped.
      }
      await player.release();
    }
    if (resourcePath && AlarmPlayback.host) {
      try {
        await AlarmPlayback.host.resourceManager.closeRawFd(resourcePath);
      } catch (_err) {
        // The descriptor may already be closed.
      }
    }
    await AlarmVolume.restore();
  }

  private static waitFor(player: media.AVPlayer, expected: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const stateChange = (state: string): void => {
        if (state === expected) {
          player.off('stateChange', stateChange);
          resolve();
        } else if (state === 'error' || state === 'released') {
          player.off('stateChange', stateChange);
          reject(new Error('AVPlayer changed to ' + state));
        }
      };
      player.on('stateChange', stateChange);
    });
  }
}
