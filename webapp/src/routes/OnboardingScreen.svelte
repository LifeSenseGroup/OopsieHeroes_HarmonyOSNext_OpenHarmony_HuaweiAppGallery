<script lang="ts">
import { _ } from 'svelte-i18n'
import { locale, locales } from 'svelte-i18n'
import { onMount , onDestroy } from 'svelte';
import { push, pop} from 'svelte-spa-router'
import Onboarding from '../components/Onboarding.svelte'
import {store_smallOrLargeImageTxt } from '../stores.js' 
import { exitApp, requestMicrophonePermission } from '../utils/NativeBridge'
  

var progress = 1;
let backgroundImage_url = "";
let showPrivacyConsent = false;
const privacyConsentKey = "oopsiePrivacyPolicyAccepted";
const microphoneFlowKey = "oopsieOnboardingMicrophoneResult";

var myScreenOrientation = window.screen.orientation;

function popWindow(progress:number)
{
   if (progress == 4) 
   {
      pop();
   }
}

async function prepareFirstRun() {
  if (localStorage.getItem(privacyConsentKey) === "true") return;

  const previousMicrophoneResult = sessionStorage.getItem(microphoneFlowKey);
  if (previousMicrophoneResult === "granted" || previousMicrophoneResult === "denied") {
    showPrivacyConsent = true;
    return;
  }
  if (previousMicrophoneResult === "requested") return;

  // Let the onboarding page paint before ArkWeb presents the native permission dialog.
  sessionStorage.setItem(microphoneFlowKey, "requested");
  await new Promise<void>((resolve) => setTimeout(resolve, 250));
  try {
    const microphoneGranted = await requestMicrophonePermission();
    sessionStorage.setItem(microphoneFlowKey, microphoneGranted ? "granted" : "denied");
    showPrivacyConsent = true;
  } catch (error) {
    console.error("Microphone permission request failed before privacy consent.", error);
    sessionStorage.setItem(microphoneFlowKey, "denied");
    showPrivacyConsent = true;
  }
}

function agreeToPrivacyPolicy() {
  localStorage.setItem(privacyConsentKey, "true");
  sessionStorage.removeItem(microphoneFlowKey);
  showPrivacyConsent = false;
}

function openPrivacyPolicy() {
  push("#/PrivacyPolicyScreen");
}

function disagreeAndExit() {
  exitApp();
}

$: popWindow(progress)

try {
    myScreenOrientation.lock("portrait"); // prevent from rotating screen
  } catch (error) {
    console.error(error);
  }

  console.log("loading")
 

	onMount( 
         () => {

          let imagePrefix = "build/images/"
          backgroundImage_url = imagePrefix + "background_intro_" +  $store_smallOrLargeImageTxt + ".jpg"
          console.log("mounted")

          prepareFirstRun();
	  
    });

    onDestroy(() => {
      try {
        myScreenOrientation.unlock(); // screen might be rotated again
      } catch (error) {
        console.error(error);
      }
     

    });
  </script>   
    

<style>

.center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

.bg {
     /* Center and scale the image nicely */
     background-repeat: no-repeat;
     background-size: 100vw 100vh;
     height: 100%;
     width: 100%;
     }


 /* Style the container for the Onboarding screen */
 .onboarding-container {
    position: absolute;
    bottom: 13.5%; /* Position at the bottom */
    left: 50%; /* Center horizontally */
    transform: translateX(-50%); /* Adjust to center horizontally */
    padding: 10px; /* Add padding as needed */
    background-color: white;
    z-index: 1;
  }

  
  .roundedBorders{ 
    border-radius: 20px;
  }

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

</style>


<div class="bg" style="height : 100%; width:100%; background-image: url({backgroundImage_url});"> 
  <div class="center" style = "height:40%;width:100%">
  {#if progress!=3 }  
  <img style = "height:auto;width:80%; object-fit: scale-down; max-height: 80%;" src="build/images/logo_characters.png">
  {/if}

  </div>

  <div class="onboarding-container roundedBorders">
  <Onboarding  bind:section = {progress} >
  </Onboarding>
</div>

{#if showPrivacyConsent}
  <div class="privacy-consent-backdrop">
    <section
      class="privacy-consent-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={$_("HomeScreen.privacyConsentLabel")}
    >
      <p>
        {$_("HomeScreen.privacyConsentStart")} <a href="#/PrivacyPolicyScreen" on:click|preventDefault={openPrivacyPolicy}>{$_("HomeScreen.Privacy Policy")}</a>{$_("HomeScreen.privacyConsentEnd")}
      </p>
      <div class="privacy-consent-actions">
        <button class="privacy-consent-disagree" on:click={disagreeAndExit}>
          {$_("HomeScreen.Disagree and Exit")}
        </button>
        <button class="privacy-consent-agree" on:click={agreeToPrivacyPolicy}>
          {$_("HomeScreen.Agree and Continue")}
        </button>
      </div>
    </section>
  </div>
{/if}

</div>

