<script lang="ts">
  import { _ } from 'svelte-i18n'
	import { locale, locales } from 'svelte-i18n'
	import { onMount , onDestroy } from 'svelte';
  import { cubicInOut } from 'svelte/easing';
  import {push, pop} from 'svelte-spa-router'
  import LSGCalendar from '../components/LSGCalendar.svelte'
  import LeakWindow  from '../components/LeakWindow.svelte';
  import NightlyOutlook from '../components/NightlyOutlook.svelte';
  import {store_smallOrLargeImageTxt} from '../stores';
  import { getLeaks, getStarts, getStops } from '../utils/dataStorage';
  import type { EventOopsie } from '../utils/dataStructures';
  import type { GenerateHeatMapResult } from '../utils/heatmapLogic';
  import { anchorStartsForPredictiveLeakTiming, computeAlarmState } from '../utils/PredictionEngine';
  import { stopSelectedAlarm } from '../utils/NativeBridge';
  import {
    resumePredictiveStaircaseIfNeeded,
    activatePredictiveStaircaseAlarm,
    deactivatePredictiveStaircaseAlarm,
    armPredictiveStaircaseFromProjection
  } from '../utils/PredictiveStaircaseScheduler';
  import { isPredictionAlarmActivated, getPredictionHistoryCutoffMs, DISMISSED_PREDICTION_KEY, ACTIVE_PREDICTION_SIGNATURE_KEY, ACTIVE_PREDICTION_EXPIRES_AT_KEY, expirePredictionOfferForSleepStart } from '../utils/predictionLifecycle';
  import { isMeasuringNightInProgress } from '../utils/measuringSession';
   

  const myScreenOrientation = window.screen.orientation;
  let backgroundImage = "";
  let leaks: EventOopsie[] = [];
  let starts: EventOopsie[] = [];
  let stops: EventOopsie[] = [];
  let heatMapStats: GenerateHeatMapResult | null = null;
  let showPredictionBox = false;
  let predictionAlarmActive = false;
  let predictionIconButton: HTMLButtonElement | null = null;
  let currentPredictionSignature: string | null = null;
  let predictionUiTicker: ReturnType<typeof setInterval> | null = null;
  /** Prevents the 1s refresh ticker from reopening the box right after the user closed it. */
  let predictionBoxUserDismissed = false;
	onMount(async () => {
    backgroundImage = "build/images/background_intro_" +  $store_smallOrLargeImageTxt + ".jpg";

    try {
      await myScreenOrientation.lock("portrait"); // prevent from rotating screen
    } catch (error) {
      console.error(error);
    }

    try {
      leaks = await getLeaks();
      starts = await getStarts();
      stops = await getStops();
      refreshPredictionState();
      predictionUiTicker = setInterval(() => {
        void refreshPredictionState();
      }, 1000);
    } catch (error) {
      console.error(error);
      leaks = [];
      starts = [];
      stops = [];
      heatMapStats = null;
      currentPredictionSignature = null;
      showPredictionBox = false;
    }
  });

  function closePredictionBox() {
    if (currentPredictionSignature) {
      localStorage.setItem(DISMISSED_PREDICTION_KEY, currentPredictionSignature);
    }
    predictionBoxUserDismissed = true;
    showPredictionBox = false;
  }

  function openPredictionBox() {
    if (heatMapStats?.toiletVisitMinutesAfterSleep == null) return;
    localStorage.removeItem(DISMISSED_PREDICTION_KEY);
    predictionBoxUserDismissed = false;
    showPredictionBox = true;
  }

  function handleBackNavigation() {
    closePredictionBox();
    if (predictionUiTicker) {
      clearInterval(predictionUiTicker);
      predictionUiTicker = null;
    }
    pop();
  }

  function togglePredictionAlarm() {
    const target = heatMapStats?.recommendationTime;
    if (!target) return;
    const anchoredStarts = anchorStartsForPredictiveLeakTiming(starts, null);
    if (predictionAlarmActive) {
      deactivatePredictiveStaircaseAlarm();
    } else {
      activatePredictiveStaircaseAlarm(target.getTime(), anchoredStarts, leaks, new Date(), stops);
    }
    predictionAlarmActive = isPredictionAlarmActivated();
    // Choice made: the box flies back to the star button (reopen anytime).
    closePredictionBox();
  }

  function buildPredictionSignature(
    filteredLeaks: EventOopsie[],
    filteredStarts: EventOopsie[],
    filteredStops: EventOopsie[],
    stats: GenerateHeatMapResult | null
  ): string | null {
    if (stats?.toiletVisitMinutesAfterSleep == null) return null;

    const consideredLeakTimes = filteredLeaks
      .map((leak) => leak?.date instanceof Date ? leak.date.getTime() : new Date(leak?.date as any).getTime())
      .filter((ms) => Number.isFinite(ms))
      .sort((a, b) => a - b);

    const consideredStartTimes = filteredStarts
      .map((start) => start?.date instanceof Date ? start.date.getTime() : new Date(start?.date as any).getTime())
      .filter((ms) => Number.isFinite(ms))
      .sort((a, b) => a - b);

    const consideredStopTimes = filteredStops
      .map((stop) => stop?.date instanceof Date ? stop.date.getTime() : new Date(stop?.date as any).getTime())
      .filter((ms) => Number.isFinite(ms))
      .sort((a, b) => a - b);

    return `prediction-v3|offset:${stats.toiletVisitMinutesAfterSleep}|starts:${consideredStartTimes.join(',')}|leaks:${consideredLeakTimes.join(',')}|stops:${consideredStopTimes.join(',')}`;
  }

  function latestStartMs(filteredStarts: EventOopsie[]): number | null {
    let max: number | null = null;
    for (const start of filteredStarts) {
      const d = start?.date instanceof Date ? start.date : new Date(start?.date as any);
      const ms = d.getTime();
      if (Number.isFinite(ms) && (max == null || ms > max)) max = ms;
    }
    return max;
  }

  function setOrClearActivePrediction(signature: string | null, recommendationTime: Date | null) {
    if (!signature || !recommendationTime) {
      localStorage.removeItem(ACTIVE_PREDICTION_SIGNATURE_KEY);
      localStorage.removeItem(ACTIVE_PREDICTION_EXPIRES_AT_KEY);
      return;
    }

    localStorage.setItem(ACTIVE_PREDICTION_SIGNATURE_KEY, signature);
    localStorage.removeItem(ACTIVE_PREDICTION_EXPIRES_AT_KEY);
  }

  function toHeatMapLikeResult(
    recommendationTime: Date | null,
    toiletVisitMinutesAfterSleep: number | null = null
  ): GenerateHeatMapResult {
    if (!recommendationTime) {
      return {
        buckets: [],
        peakBucket: null,
        recommendationTime: null,
        toiletVisitMinutesAfterSleep: null
      };
    }

    const peakStart = new Date(recommendationTime.getTime());
    const peakEnd = new Date(peakStart.getTime() + 60 * 60_000);
    return {
      buckets: [{ start: peakStart, end: peakEnd, count: 1 }],
      peakBucket: { start: peakStart, end: peakEnd, count: 1 },
      recommendationTime,
      toiletVisitMinutesAfterSleep
    };
  }

  async function refreshPredictionState() {
    try {
      leaks = await getLeaks();
      starts = await getStarts();
      stops = await getStops();
    } catch (error) {
      console.error('refreshPredictionState: failed to reload events', error);
    }

    const measuringInProgress = isMeasuringNightInProgress(starts, stops, leaks);
    const anchoredStarts = anchorStartsForPredictiveLeakTiming(starts, null);

    if (measuringInProgress && localStorage.getItem(ACTIVE_PREDICTION_SIGNATURE_KEY)) {
      const sleepStartMs = latestStartMs(anchoredStarts);
      if (sleepStartMs != null) {
        expirePredictionOfferForSleepStart(sleepStartMs);
      }
    }

    // Legacy: drop target-time expiry from older builds.
    if (localStorage.getItem(ACTIVE_PREDICTION_EXPIRES_AT_KEY)) {
      localStorage.removeItem(ACTIVE_PREDICTION_EXPIRES_AT_KEY);
    }

    predictionAlarmActive = isPredictionAlarmActivated();

    // Rolling window: always feed the full history; the engine keeps only the last 8 nights.
    const historyCutoffMs = getPredictionHistoryCutoffMs();
    const alarmState = computeAlarmState(anchoredStarts, leaks, new Date(), stops, historyCutoffMs);

    const canOfferPrediction = !measuringInProgress;

    if (alarmState.alarm_mode !== 'PREDICTIVE') {
      console.info('[prediction]', alarmState.debug?.reason ?? 'REACTIVE mode');
    } else {
      console.info(
        '[prediction] PREDICTIVE →',
        alarmState.target_alarm_timestamp?.toLocaleString()
      );
    }

    const computedRecommendation =
      canOfferPrediction && alarmState.alarm_mode === 'PREDICTIVE'
        ? alarmState.target_alarm_timestamp
        : null;
    const computedMs = computedRecommendation?.getTime() ?? null;

    if (computedMs && alarmState.alarm_mode === 'PREDICTIVE' && canOfferPrediction) {
      if (isPredictionAlarmActivated()) {
        armPredictiveStaircaseFromProjection(anchoredStarts, leaks, new Date(), stops);
      }
      resumePredictiveStaircaseIfNeeded();
    }

    // Box stays until Go to sleep; no hide when projected target time is in the past.
    heatMapStats = toHeatMapLikeResult(
      computedRecommendation,
      canOfferPrediction && alarmState.alarm_mode === 'PREDICTIVE'
        ? alarmState.predicted_toilet_visit_minutes_after_sleep
        : null
    );
    currentPredictionSignature =
      buildPredictionSignature(leaks, anchoredStarts, stops, heatMapStats) ??
      localStorage.getItem(ACTIVE_PREDICTION_SIGNATURE_KEY);

    setOrClearActivePrediction(currentPredictionSignature, heatMapStats?.recommendationTime ?? null);

    const dismissedPredictionSignature = localStorage.getItem(DISMISSED_PREDICTION_KEY);
    const shouldShow = Boolean(
      heatMapStats?.toiletVisitMinutesAfterSleep != null &&
      currentPredictionSignature &&
      currentPredictionSignature !== dismissedPredictionSignature
    );

    if (currentPredictionSignature && currentPredictionSignature !== dismissedPredictionSignature) {
      predictionBoxUserDismissed = false;
    }

    if (predictionBoxUserDismissed || dismissedPredictionSignature === currentPredictionSignature) {
      showPredictionBox = false;
    } else if (shouldShow) {
      showPredictionBox = true;
    } else {
      showPredictionBox = false;
    }
  }

  function flyToPredictionIcon(node: Element, { duration = 360 } = {}) {
    const cardRect = node.getBoundingClientRect();
    const iconRect = predictionIconButton?.getBoundingClientRect();

    const dx = iconRect
      ? iconRect.left + iconRect.width / 2 - (cardRect.left + cardRect.width / 2)
      : 200;
    const dy = iconRect
      ? iconRect.top + iconRect.height / 2 - (cardRect.top + cardRect.height / 2)
      : -120;

    return {
      duration,
      easing: cubicInOut,
      css: (t, u) => `
        transform: translate(${dx * u}px, ${dy * u}px) scale(${0.9 + 0.1 * t});
        opacity: ${Math.max(0, t)};
      `
    };
  }

    onDestroy(() => {
      if (predictionUiTicker) {
        clearInterval(predictionUiTicker);
      }
      stopSelectedAlarm();
      try {
        myScreenOrientation.unlock();
      } catch (error) {
        console.error(error);
      }
     });
    
       

</script>

<style>
.bg {
  background-repeat: no-repeat;
  background-size: 100vw 100vh;
  overflow-y: auto;
  position: relative;
}

.center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button{
	  color: white;
    background-color: transparent;
    background-repeat: no-repeat;
    border: none;
    cursor: pointer;
    overflow: hidden;
    outline: none;
	}

  .container {  display: grid;
  grid-template-columns: minmax(0,0.7fr) 1.7fr 0.6fr;
  grid-template-rows: 0.8fr 2.8fr 0.6fr;
  gap: 1px 1px;
  grid-auto-flow: row;
  grid-template-areas:
    ". . ."
    "Icon ButtonLabel marge"
    ". . .";
    height: 8.6vh;
}

.Icon { grid-area: Icon; 
  margin-top:48px;
}

.marge { grid-area: marge; }

.ButtonLabel { grid-area: ButtonLabel; 
               color: white;
               /*font-size: 3vh;  */
              font-size: 15.3px;}

  .flex-container {
  display: flex;
  align-items: center;
}

.flex-container button {
  margin-right: 10px; 
}



.Icon {
  position: absolute;
  top: 0;
  left: 0;
  margin: 20px; /* Adjust the margin as needed */
  z-index: 11;
}

.PredictionIcon {
  position: absolute;
  top: 0;
  right: 0;
  margin: 20px;
  margin-top: 34px;
  z-index: 2;
}

.PredictionIcon.hidden {
  opacity: 0.35;
}

.prediction-toggle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 235, 150, 0.65);
  background: rgba(255, 215, 120, 0.2);
  color: #fff4c2;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(255, 214, 102, 0.35);
}

.prediction-toggle:disabled {
  cursor: default;
  opacity: 0.45;
  animation: none;
}

.prediction-toggle.can-open {
  animation: predictionPulse 1.8s ease-in-out infinite;
}

@keyframes predictionPulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

.container {
  position: relative;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.nightly-outlook-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
  pointer-events: none;
}

.nightly-outlook-fly {
  pointer-events: none;
}

.calendar-layout {
  margin-bottom: 80px;
  position: relative;
  z-index: 1;
}

</style>


<div class=" bg" style="height: 100%; width: 100%; background-image: url({backgroundImage});">
  <div class="container">
    <div class="ButtonLabel center">
      <div class="flex-container">
      <h1 style="font-family: Arial; font-size: 20px;">{$_("CalendarScreen.Calendar")}</h1>
    </div>
  </div>
  <div class="Icon">
    <button class="button" on:click={handleBackNavigation}>
      <img style="width: 5vw" src="build/images/Arrow_icon.svg" alt={$_('a11y.back')}>
    </button>
  </div>
  <div class="PredictionIcon {heatMapStats?.toiletVisitMinutesAfterSleep != null ? '' : 'hidden'}">
    <button
      class="prediction-toggle {showPredictionBox ? '' : 'can-open'}"
      type="button"
      aria-label={$_('mission.open')}
      title={$_('mission.predictionTitle')}
      disabled={heatMapStats?.toiletVisitMinutesAfterSleep == null}
      bind:this={predictionIconButton}
      on:click={openPredictionBox}
    >
      ✨
    </button>
  </div>
  </div>
  <div class="calendar-layout">
    <LSGCalendar></LSGCalendar>
    <LeakWindow>
      <div slot="after-stats" class="nightly-outlook-wrap">
        {#if heatMapStats?.toiletVisitMinutesAfterSleep != null && showPredictionBox}
          <div class="nightly-outlook-fly" transition:flyToPredictionIcon>
            <NightlyOutlook
              {heatMapStats}
              alarmActivated={predictionAlarmActive}
              on:close={closePredictionBox}
              on:toggleAlarm={togglePredictionAlarm}
            />
          </div>
        {/if}
      </div>
    </LeakWindow>
  </div>
</div>


  

