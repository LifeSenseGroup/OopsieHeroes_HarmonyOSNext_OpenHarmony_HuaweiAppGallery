<script lang="ts">
  import { _ } from "svelte-i18n";
  import { locale, locales } from "svelte-i18n";
  import { onMount, onDestroy } from "svelte";
  import { store_alarm, store_onBoardingDone, store_smallOrLargeImageTxt, store_customer_sex, store_globalSyncLock } from "../stores.js";
  import { setDataStorageBlockWriteToDB, storeGetSettingInfo, storeGetUserInfo, createAndStoreStart, createAndStoreStop, createAndStoreLeak, createAndStoreWake, getRemainingEvents, getLeaks, getStarts, getStops, getWakes, globalSyncLock  } from "../utils/dataStorage";
  import { consumePredictionCycle, hadActivePredictionCycle, expirePredictionOfferForSleepStart } from "../utils/predictionLifecycle";
  import {
    cancelPredictiveStaircase,
    dismissStaircaseWake,
    getStaircaseWakeDismissSnapshot,
    isStaircaseWakeActive,
    isPredictiveStaircaseInProgress,
    isBetweenStaircasePhases,
    shouldSuppressReactiveAlarmForStaircase,
    resumePredictiveStaircaseIfNeeded,
    schedulePredictiveStaircaseForNight
  } from "../utils/PredictiveStaircaseScheduler";
  import ButtonWithIcon from "../components/ButtonWithIcon.svelte";
  import HeroSpeechBubble from "../components/HeroSpeechBubble.svelte";
  import { eMode } from "../utils/dataStructures";
  import type { EventOopsie } from "../utils/dataStructures";
  import { getMeasuredNights, getLevel, isSmallScreen, checkEventsAre_X_minApart  } from "../utils/utils";
  import { resolveHeroCoachMessage } from "../utils/bedtimeCoach";
  import { TEST_createSomeEventsThisMonthAndStoreInLocalDB } from "../utils/tests";
  import { stopSound,startSoundDetection,stopSoundDetection, playSelectedAlarm, exitApp } from "../utils/NativeBridge";
  import { push } from "svelte-spa-router";
  import { RealmStoreUserIfNeeded, RealmStoreEvents  } from "../utils/accesRealm";
  import Trustpilot from '../components/Trustpilot.svelte';

  var smallOrLargeImageTxt = isSmallScreen() ? "Phone" : "Tablet"; // Phone or Tablet
  $store_smallOrLargeImageTxt = smallOrLargeImageTxt;

  let imagePrefix = "build/images/";
  let bg_image_url = imagePrefix + "Dag-oepsie" + ".svg";
  let image_url_boyGirl = imagePrefix + "boy.png";
  let isSyncing = false;
  let isStopping = false; //added this for preventing multiple clicks on stop button which can cause multiple calls to stopSoundDetection and createAndStoreStop
                          //(which can cause problems with the order of events in localDB and bridge)
  let syncTimer;
  /** Re-check staircase phase times (manual clock changes don't fire setTimeout early). */
  let staircaseTicker: ReturnType<typeof setInterval> | null = null;
  let showPrivacyConsent = false;
  const privacyConsentKey = "oopsiePrivacyPolicyAccepted";

  function continueToOnboardingIfNeeded() {
    if ($store_onBoardingDone == 1) return;

    if (localStorage.getItem(privacyConsentKey) === "true") {
      push("#/OnboardingScreen");
      return;
    }

    showPrivacyConsent = true;
  }

  function agreeToPrivacyPolicy() {
    localStorage.setItem(privacyConsentKey, "true");
    showPrivacyConsent = false;
    push("#/OnboardingScreen");
  }

  function openPrivacyPolicy() {
    push("#/PrivacyPolicyScreen");
  }

  function disagreeAndExit() {
    exitApp();
  }

  function onStaircaseClockCheck() {
    resumePredictiveStaircaseIfNeeded();
  }

  function startStaircaseClockWatch() {
    if (staircaseTicker) return;
    staircaseTicker = setInterval(onStaircaseClockCheck, 1000);
    onStaircaseClockCheck();
  }

  function stopStaircaseClockWatch() {
    if (staircaseTicker) {
      clearInterval(staircaseTicker);
      staircaseTicker = null;
    }
  }

  $: if (mode === eMode.SLEEPING) {
    startStaircaseClockWatch();
  } else {
    stopStaircaseClockWatch();
  }

  console.log(bg_image_url);
  let mode: eMode = eMode.WAKE;
    var latestEventDate: Date = new Date(0);

  let coachId: string | null = null;
  let coachDryStreak = 0;
  let coachText: string | null = null;
  let coachTicker: ReturnType<typeof setInterval> | null = null;

  async function refreshCoachMessage() {
    if (mode !== eMode.WAKE) {
      coachId = null;
      return;
    }
    try {
      const starts = await getStarts();
      const stops = await getStops();
      const leaks = await getLeaks();
      const wakes = await getWakes();
      const result = resolveHeroCoachMessage({
        starts,
        stops,
        leaks,
        wakes,
        now: new Date(),
        mode
      });
      coachId = result?.id ?? null;
      coachDryStreak = result?.dryStreak ?? 0;
    } catch (error) {
      console.error("coach message error:", error);
      coachId = null;
    }
  }

  $: coachText = coachId
    ? $_("coach." + coachId, { values: { dry_streak: coachDryStreak } })
    : null;

  function startCoachWatch() {
    if (coachTicker) return;
    void refreshCoachMessage();
    coachTicker = setInterval(() => {
      void refreshCoachMessage();
    }, 15000);
  }

  function stopCoachWatch() {
    if (coachTicker) {
      clearInterval(coachTicker);
      coachTicker = null;
    }
    coachId = null;
  }

  $: if (mode === eMode.WAKE) {
    startCoachWatch();
  } else {
    stopCoachWatch();
  }

  function alarmScreen(alarm) {
    console.log("alarm functions");
    if (alarm == 1) {
      const staircaseWake = isStaircaseWakeActive();
      const predictiveStaircase = isPredictiveStaircaseInProgress();
      const inQuietWindow = shouldSuppressReactiveAlarmForStaircase();
      const betweenPhases = isBetweenStaircasePhases();

      // Whisper/nudge playback + mic-off tail: ignore moisture — unless mic is back on in a gap window.
      if (!staircaseWake && inQuietWindow && !betweenPhases) {
        $store_alarm = 0;
        return;
      }

      // Rest of staircase night (before whisper, etc.): suppress reactive alarm — staircase owns it.
      // Exception: between-phase gap with mic on → real leak wins.
      if (predictiveStaircase && !staircaseWake && !betweenPhases) {
        $store_alarm = 0;
        return;
      }

      const predictionNight = betweenPhases && hadActivePredictionCycle();

      // Predictive wake: audio already started in the scheduler — avoid cancel/replay and synthetic leak row.
      if (!staircaseWake) {
        cancelPredictiveStaircase();
        playSelectedAlarm({ volume: 1, loop: true });
      }
      $store_alarm = 0; // reset store value
      mode = eMode.ALARM;
      bg_image_url =
        "build/images/background_alarm_" + smallOrLargeImageTxt + ".jpg";
      let date = new Date();

      if (!staircaseWake && checkEventsAre_X_minApart(date, latestEventDate)) {
        createAndStoreLeak(new Date());
        if (predictionNight) {
          consumePredictionCycle(latestEventDate.getTime());
        }
        setTimeout(async () => {
              console.log("DEBUG: Running final night sync for Leak...");
              await syncEventsToBridge();
          }, 2000);
      }
    }
  }

  $: alarmScreen($store_alarm); // if store_alarm changes alarmScreen() is automatically called by svelte.  Watch out that stores.js is not init as first component by svelte so in the beginning this can trigger a call when stores.js is inited.


  console.log("loading");

onMount(() => {
  console.log("mounted");

  setDataStorageBlockWriteToDB(false);
  var a = getMeasuredNights();
  console.log("measured nights", a);

  storeGetUserInfo().then(() => {
    return storeGetSettingInfo();
  })
  .then(() => {
    continueToOnboardingIfNeeded();

    // Now this will actually have data from storeGetUserInfo
    if ($store_customer_sex == "female") {
      image_url_boyGirl = imagePrefix + "girl.png";
    } else {
      image_url_boyGirl = imagePrefix + "boy.png";
    }

    resumePredictiveStaircaseIfNeeded();

    if ($store_onBoardingDone == 1) {
      RealmStoreUserIfNeeded().then(() => {
        let eventNR = localStorage.getItem("eventsSavedToMongDB") || "0";

        getRemainingEvents(parseInt(eventNR))
          .then((events) => {
            console.log("remaining events", events);
            if (events.length > 0) {
              RealmStoreEvents(events, parseInt(eventNR));
            }
          })
          .catch((error) => {
            console.error("Sync Error:", error);
          });
      });
    }
  })
  .catch((error) => {
    console.error("Initialization Error:", error);
    continueToOnboardingIfNeeded();
  });
});


  onDestroy(() => {
      stopStaircaseClockWatch();
      stopCoachWatch();
      if (syncTimer) {
        clearTimeout(syncTimer);
        console.log("DEBUG: Component destroyed, cleared pending sync timer.");
      }
    });


  async function syncEventsToBridge() {
    if ($store_globalSyncLock) {
          console.log("DEBUG: Sync already in progress, skipping.");
          return;
    }

    $store_globalSyncLock = true;
    let eventNR = localStorage.getItem("eventsSavedToMongDB") || "0";

    try {
        const events = await getRemainingEvents(parseInt(eventNR));
        if (events.length > 0) {
            await RealmStoreEvents(events, parseInt(eventNR));
        }
    } finally {
        $store_globalSyncLock = false;
    }
  }

  async function schedulePredictiveStaircaseForTonight(nightStartDate: Date) {
    try {
      const starts = await getStarts();
      const leaks = await getLeaks();
      const stops = await getStops();
      await schedulePredictiveStaircaseForNight(nightStartDate, starts, leaks, new Date(), stops);
    } catch (error) {
      console.error("Predictive staircase scheduling error:", error);
    }
  }

  async function ButtonClick() {
  if (isStopping) return;

    if (mode == eMode.ALARM) {
      const staircaseWake = isStaircaseWakeActive();
      const staircaseSnap = staircaseWake ? getStaircaseWakeDismissSnapshot() : null;
      dismissStaircaseWake();
      stopSound();
      stopSoundDetection();
      cancelPredictiveStaircase();
      mode = eMode.WAKE;
      bg_image_url = imagePrefix + "Dag-oepsie" + ".svg";
      if (staircaseSnap) {
        void (async () => {
          try {
            await createAndStoreWake({
              dismissedAt: new Date(),
              stageReached: staircaseSnap.stageReached,
              predictedTime: staircaseSnap.predictedTime
            });
            await syncEventsToBridge();
          } catch (e) {
            console.error("wake event / sync failed:", e);
          }
        })();
      }
      return;
    }

    stopSound();
    console.log("clicked");

    if (mode == eMode.WAKE) {
      mode = eMode.SLEEPING;

      getLevel().then(async (levelNr) => {
        bg_image_url =
          "build/images/backgrounds/sleepBackgroundLev" +
          levelNr.toString() +
          smallOrLargeImageTxt +
          ".png";

        latestEventDate = new Date();
        await createAndStoreStart(latestEventDate);
        expirePredictionOfferForSleepStart(latestEventDate.getTime());
        await schedulePredictiveStaircaseForTonight(latestEventDate);
        resumePredictiveStaircaseIfNeeded();
        startSoundDetection();
        setTimeout(async () => {
              console.log("DEBUG: Running final night sync for Leak and Stop...");
              await syncEventsToBridge();
          }, 1000);
      });
    } else {
    isStopping = true;
    const now = new Date();

    const isValidNight = checkEventsAre_X_minApart(now, latestEventDate);
    // Snapshot BEFORE cancelPredictiveStaircase below wipes the schedule:
    // user pressed "Wake up" after a staircase phase fired = alarm dismissal (stage 1/2).
    const staircaseSnap = getStaircaseWakeDismissSnapshot();

    try {
      if (isValidNight) {
        await createAndStoreStop(now);
        consumePredictionCycle(now.getTime());
      }
      if (staircaseSnap) {
        await createAndStoreWake({
          dismissedAt: now,
          stageReached: staircaseSnap.stageReached,
          predictedTime: staircaseSnap.predictedTime
        });
      }

      stopSoundDetection();
      cancelPredictiveStaircase();

      console.log("DEBUG: Final night sync...");
      await syncEventsToBridge();

      if (mode == eMode.SLEEPING) {
        if (isValidNight) {
          push("#/StarScreen");
        } else {
          mode = eMode.WAKE;
          bg_image_url = imagePrefix + "Dag-oepsie" + ".svg";
        }
      } else {
        mode = eMode.WAKE;
        bg_image_url = imagePrefix + "Dag-oepsie" + ".svg";
      }
    } catch (e) {
      console.error("stop/wake logging failed:", e);
    } finally {
      isStopping = false;
    }
  }
 }
</script>

<div
  class="container bg"
  style="height : 100%; width:100%; background-image: url({bg_image_url});"
>
  {#if mode == eMode.WAKE}
    <a class="Hamburger HamburgImage" href="#/SettingsScreen" />

    <a class="Calendar CalendarImage" href="#/CalendarScreen" />
  {/if}

  {#if $store_alarm == 1}
    <h1>{$_("HomeScreen.Alarm")}</h1>
  {/if}
  <div class="Button center">
    <ButtonWithIcon modeI={mode} on:click={ButtonClick} />
  </div>
  <div
    class="BoyGirl BoyImage"
    style="height : 100%; width:100%; background-image: url({image_url_boyGirl});"
  />
  <div class="Speech">
    <HeroSpeechBubble text={coachText} imageSrc={image_url_boyGirl} />
  </div>
</div>
{#if showPrivacyConsent}
  <div class="privacy-consent-backdrop">
    <section
      class="privacy-consent-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Please read our Privacy Policy for Oopsie Heroes"
    >
      <p>
        Please read our <a href="#/PrivacyPolicyScreen" on:click|preventDefault={openPrivacyPolicy}>Privacy Policy</a> for Oopsie Heroes
      </p>
      <div class="privacy-consent-actions">
        <button class="privacy-consent-disagree" on:click={disagreeAndExit}>
          Disagree and Exit
        </button>
        <button class="privacy-consent-agree" on:click={agreeToPrivacyPolicy}>
          Agree and Continue
        </button>
      </div>
    </section>
  </div>
{/if}

<style>
  .privacy-consent-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(8, 21, 43, 0.62);
  }

  .privacy-consent-dialog {
    width: 100%;
    max-width: 420px;
    padding: 24px;
    border-radius: 20px;
    background: #ffffff;
    color: #1c2b46;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
    font-family: Arial, sans-serif;
  }

  .privacy-consent-dialog h2 {
    margin: 0 0 14px;
    font-size: 22px;
    line-height: 1.3;
  }

  .privacy-consent-dialog p {
    margin: 0;
    font-size: 16px;
    line-height: 1.5;
  }

  .privacy-consent-dialog a {
    color: #1769d2;
    text-decoration: underline;
  }

  .privacy-consent-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;
  }

  .privacy-consent-actions button {
    min-height: 48px;
    padding: 10px 16px;
    border: 0;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }

  .privacy-consent-disagree {
    background: #edf0f5;
    color: #26354f;
  }

  .privacy-consent-agree {
    background: #1769d2;
    color: #ffffff;
  }

  /* grid.layoutit.com?id=aTEqNdq */
  .bg {
    /* background-image: url({bg_bg_image_url}); done hardcoded in the html*/
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  .BoyImage {
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .HamburgImage {
    background-image: url("images/Hamburger_icon.svg");
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }

  .CalendarImage {
    background-image: url("images/Calendar_icon.svg");
    background-repeat: no-repeat;
    background-size: contain;
  }

  .container {
    display: grid;
    grid-template-columns: minmax(0, 0.4fr) minmax(0, 0.6fr) minmax(0, 0.6fr) minmax(
        0,
        0.8fr
      ) minmax(0, 5.1fr) minmax(0, 0.8fr) minmax(0, 0.6fr) minmax(0, 0.6fr) minmax(
        0,
        0.4fr
      );
    grid-template-rows: minmax(0, 0.5fr) minmax(0, 0.3fr) minmax(0, 1.1fr) minmax(
        0,
        4.5fr
      ) minmax(0, 0.4fr) minmax(0, 0.5fr) minmax(0, 0.5fr);
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      ". . . . . . . . ."
      ". Hamburger . . . . . Calendar ."
      ". . . . . . . . ."
      ". . . . BoyGirl . . . ."
      ". . . . . . . . ."
      ". . . . Button . . . ."
      ". . . . . . . . .";
    height: 100%;
    width: 100%;
  }

  .Hamburger {
    grid-area: Hamburger;
    height: 100%;
    width: 100%;
  }

  .Calendar {
    grid-area: Calendar;
    height: 100%;
    width: 100%;
  }

  .Button {
    grid-area: Button;
    height: 100%;
    width: 100%;
  }

  .BoyGirl {
    grid-area: BoyGirl;
    height: 100%;
    width: 100%;
  }

  .Speech {
    grid-area: BoyGirl;
    height: 100%;
    width: 100%;
    z-index: 2;
    pointer-events: none;
    overflow: visible;
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :global(html, body) {
    height: 100%;
  }

  a {
    display: block;
  }
</style>

<Trustpilot />
