<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { GenerateHeatMapResult } from '../utils/heatmapLogic';
  import { formatMinutesAfterSleep } from '../utils/PredictionEngine';

  type HeatMapStatsWithTotal = GenerateHeatMapResult & { totalAnalyzed?: number };

  export let heatMapStats: HeatMapStatsWithTotal;
  export let alarmActivated = false;
  const dispatch = createEventDispatcher<{ close: undefined; toggleAlarm: undefined }>();

  $: toiletVisitMinutesAfterSleep = heatMapStats?.toiletVisitMinutesAfterSleep ?? null;
  $: offsetLabel =
    toiletVisitMinutesAfterSleep != null
      ? formatMinutesAfterSleep(toiletVisitMinutesAfterSleep)
      : '';
</script>

{#if toiletVisitMinutesAfterSleep != null}
  <div class="mission-card">
    <button
      class="close-btn"
      type="button"
      aria-label="Close mission prediction"
      on:click={() => dispatch('close')}
    >
      ×
    </button>
    <div class="eyebrow">Hero Mission Control</div>

    <div class="hero-tip" role="status" aria-live="polite">
      <div class="mission-lines">
        <span class="mission-prefix">Mission:</span>
        <div class="mission-body">
          <span class="tip-line">Toilet visit ~{offsetLabel}</span>
          <span class="tip-line">after going to sleep</span>
        </div>
      </div>
    </div>
    <button
      class="activate-btn {alarmActivated ? 'active' : ''}"
      type="button"
      on:click={() => dispatch('toggleAlarm')}
    >
      {alarmActivated ? 'Deactivate alarm' : 'Activate alarm'}
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
