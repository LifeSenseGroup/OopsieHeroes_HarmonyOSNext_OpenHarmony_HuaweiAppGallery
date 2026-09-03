<script lang="ts">
  import { _ } from "svelte-i18n";
  import { locale, locales } from "svelte-i18n";
  import { onMount, onDestroy } from "svelte";
  import { store_alarm, store_onBoardingDone, store_smallOrLargeImageTxt, store_customer_sex,  } from "../stores.js";
  import { setDataStorageBlockWriteToDB, createAndStoreStart, createAndStoreStop, createAndStoreLeak  } from "../utils/dataStorage";
  import ButtonWithIcon from "../components/ButtonWithIcon.svelte";
  import { eMode } from "../utils/dataStructures";
  import { getMeasuredNights, getLevel, isSmallScreen, checkEventsAre_X_minApart  } from "../utils/utils";
  import { TEST_createSomeEventsThisMonthAndStoreInLocalDB } from "../utils/tests";
  import { stopSound,startSoundDetection,stopSoundDetection } from "../utils/NativeBridge";
  import { push } from "svelte-spa-router";

  var smallOrLargeImageTxt = isSmallScreen() ? "Phone" : "Tablet"; // Phone or Tablet
  $store_smallOrLargeImageTxt = smallOrLargeImageTxt;

  let imagePrefix = "build/images/";
  let bg_image_url = imagePrefix + "Dag-oepsie" + ".svg";
  let image_url_boyGirl = imagePrefix + "boy.png";

  console.log(bg_image_url);
  let mode: eMode = eMode.WAKE;
  var latestEventDate: Date = new Date(null);

  function alarmScreen(alarm) {
    console.log("alarm functions");
    if (alarm == 1) {
      $store_alarm = 0; // reset store value
      //push('/alarmScreen');
      mode = eMode.ALARM;
      bg_image_url =
        "build/images/background_alarm_" + smallOrLargeImageTxt + ".jpg";
      let date = new Date();

      if (checkEventsAre_X_minApart(date, latestEventDate)) {
        createAndStoreLeak(new Date());
      }
    }
  }

  $: alarmScreen($store_alarm); // if store_alarm changes alarmScreen() is automatically called by svelte.  Watch out that stores.js is not init as first component by svelte so in the beginning this can trigger a call when stores.js is inited.


  console.log("loading");

  onMount(() => {
    console.log("mounted");
    // next statement not really needed only if loading from localDB is to slow..
    setDataStorageBlockWriteToDB(false); // we had to disable writing to local DB, since we automated that changes to some store elements are then also saved to localDB (but first time init of stores  is always triggering)
    //createAndStoreLeak(new Date())
    //TEST_createSomeEventsThisMonthAndStoreInLocalDB();
    var a = getMeasuredNights();
    console.log("measured nights", a);
    if ($store_onBoardingDone != 1) {
      push("#/OnboardingScreen");
    }
    if ($store_customer_sex == "female") {
      image_url_boyGirl = imagePrefix + "girl.png";
    }
   
  });

  function ButtonClick() {
    stopSound();
    console.log("clicked");

    if (mode == eMode.WAKE) {
      mode = eMode.SLEEPING;

      getLevel().then((levelNr) => {
        bg_image_url =
          "build/images/backgrounds/sleepBackgroundLev" +
          levelNr.toString() +
          smallOrLargeImageTxt +
          ".png";

        latestEventDate = new Date();
        createAndStoreStart(latestEventDate); // no await needed! its non blocking
        startSoundDetection();
      });
    } else {
      if (mode == eMode.SLEEPING) {
        if (checkEventsAre_X_minApart(new Date(), latestEventDate)) {
          push("#/StarScreen");
        }
      }

      if (checkEventsAre_X_minApart(new Date(), latestEventDate)) {
        createAndStoreStop(new Date());
      } // stop should only occur if there was no leak, leak will change
      stopSoundDetection();
      mode = eMode.WAKE;
      bg_image_url = imagePrefix + "Dag-oepsie" + ".svg";
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
</div>

<style>
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
