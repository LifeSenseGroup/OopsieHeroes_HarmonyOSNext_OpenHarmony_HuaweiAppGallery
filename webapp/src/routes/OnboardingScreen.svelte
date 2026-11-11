<script lang="ts">
import { _ } from 'svelte-i18n'
import { locale, locales } from 'svelte-i18n'
import { onMount , onDestroy } from 'svelte';
import { replace, pop} from 'svelte-spa-router'
import Onboarding from '../components/Onboarding.svelte'
import {store_smallOrLargeImageTxt } from '../stores.js' 
import PrivacyPolicy from '../routes/PrivacyPolicyScreen.svelte'
  

var progress = 1;
let backgroundImage_url = "";

var myScreenOrientation = window.screen.orientation;

function popWindow(progress:number)
{
   if (progress == 4) 
   {
      pop();
   }
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

</div>

