<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';
  import type { GenerateHeatMapResult } from '../utils/heatmapLogic';

  type HeatMapStatsWithTotal = GenerateHeatMapResult & { totalAnalyzed?: number };
  type Translate = (key: string, options?: { values?: Record<string, string | number> }) => string;

  export let heatMapStats: HeatMapStatsWithTotal;
  export let alarmActivated = false;
  const dispatch = createEventDispatcher<{ close: undefined; toggleAlarm: undefined }>();

  function formatOffset(totalMinutes: number, t: Translate): string {
    const rounded = Math.max(1, Math.round(totalMinutes));
    if (rounded < 60) {
      return t('mission.minutes', { values: { n: rounded } });
    }
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    if (mins === 0) {
      return hours === 1 ? t('mission.oneHour') : t('mission.hours', { values: { n: hours } });
    }
    return t('mission.hoursMinutes', { values: { hours, mins } });
  }

  $: toiletVisitMinutesAfterSleep = heatMapStats?.toiletVisitMinutesAfterSleep ?? null;
  $: offsetLabel =
    toiletVisitMinutesAfterSleep != null ? formatOffset(toiletVisitMinutesAfterSleep, $_) : '';
</script>

{#if toiletVisitMinutesAfterSleep != null}
  <div class="mission-card">
    <button
      class="close-btn"
      type="button"
      aria-label={$_('mission.close')}
      on:click={() => dispatch('close')}
    >
      ×
    </button>
    <div class="eyebrow">{$_('mission.eyebrow')}</div>

    <div class="hero-tip" role="status" aria-live="polite">
      <div class="mission-lines">
        <span class="mission-prefix">{$_('mission.prefix')}</span>
        <div class="mission-body">
          <span class="tip-line">{$_('mission.toiletVisit', { values: { offset: offsetLabel } })}</span>
          <span class="tip-line">{$_('mission.afterSleep')}</span>
        </div>
      </div>
    </div>
    <button
      class="activate-btn {alarmActivated ? 'active' : ''}"
      type="button"
      on:click={() => dispatch('toggleAlarm')}
    >
      {alarmActivated ? $_('mission.deactivate') : $_('mission.activate')}
    </button>
  </div>
{/if}

<style>
  .mission-card {
    position: relative;
    margin: 10px 12px;
    padding: 14px;
    border-radius: 16px;
    color: #eef6ff;
    background: rgba(10, 26, 43, 0.48);
    border: 1px solid rgba(165, 208, 255, 0.35);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    pointer-events: auto;
  }

  .eyebrow {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.85;
    margin-bottom: 6px;
  }

  .hero-tip {
    margin-top: 16px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 240, 157, 0.6);
    background: rgba(255, 211, 102, 0.18);
  }

  .mission-lines {
    display: flex;
    align-items: flex-start;
    gap: 0.35em;
    justify-content: center;
  }

  .mission-prefix {
    flex-shrink: 0;
    font-size: 15px;
    font-weight: 700;
    color: #fff5cc;
    line-height: 1.25;
  }

  .mission-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
  }

  .tip-line {
    display: block;
    font-size: 15px;
    font-weight: 700;
    color: #fff5cc;
    line-height: 1.2;
  }

  .close-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }


  .activate-btn {
    margin-top: 10px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(140, 220, 162, 0.7);
    background: rgba(72, 187, 120, 0.25);
    color: #e7ffee;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .activate-btn.active {
    border-color: rgba(255, 160, 150, 0.7);
    background: rgba(229, 96, 84, 0.25);
    color: #ffe9e6;
  }
</style>
