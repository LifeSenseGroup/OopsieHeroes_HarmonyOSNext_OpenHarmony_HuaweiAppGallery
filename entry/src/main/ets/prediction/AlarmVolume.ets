import { audio } from '@kit.AudioKit';

/** Phone alarm-stream override. Fractions are of the stream maximum, not the slider. */
export class AlarmVolume {
  private static previous: number | null = null;
  private static quiet: boolean = false;

  static async applyFraction(fraction: number): Promise<void> {
    try {
      const manager = audio.getAudioManager();
      const max = await manager.getMaxVolume(audio.AudioVolumeType.ALARM);
      if (AlarmVolume.previous == null) {
        AlarmVolume.previous = await manager.getVolume(audio.AudioVolumeType.ALARM);
      }
      const level = Math.max(0, Math.min(max, Math.round(max * fraction)));
      await manager.setVolume(audio.AudioVolumeType.ALARM, level);
      AlarmVolume.quiet = fraction < 0.999;
    } catch (error) {
      console.error('AlarmVolume: could not set alarm stream volume ' + JSON.stringify(error));
    }
  }

  static async restore(): Promise<void> {
    AlarmVolume.quiet = false;
    if (AlarmVolume.previous == null) {
      return;
    }
    const previous = AlarmVolume.previous;
    AlarmVolume.previous = null;
    try {
      const manager = audio.getAudioManager();
      await manager.setVolume(audio.AudioVolumeType.ALARM, previous);
    } catch (error) {
      console.error('AlarmVolume: could not restore alarm stream volume ' + JSON.stringify(error));
    }
  }

  static isQuietPhase(): boolean {
    return AlarmVolume.quiet;
  }
}
