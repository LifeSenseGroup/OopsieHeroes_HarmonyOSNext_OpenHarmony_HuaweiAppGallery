<script lang="ts">
  import { _ } from 'svelte-i18n'
	import { locale, locales } from 'svelte-i18n'
	import { onMount , onDestroy } from 'svelte';
  import {push, pop} from 'svelte-spa-router'
  import LSGCalendar from '../components/LSGCalendar.svelte'
  import LeakWindow  from '../components/LeakWindow.svelte';
  import {store_smallOrLargeImageTxt} from '../stores'
   

  var myScreenOrientation = window.screen.orientation;
  var backgroundImage = "";
  
  try {
    myScreenOrientation.lock("portrait"); // prevent from rotating screen
  } catch (error) {
    console.error(error);
  }

  console.log("loading")
 

	onMount( 
         () => {
			 backgroundImage = "build/images/background_intro_" +  $store_smallOrLargeImageTxt + ".jpg"
       console.log(backgroundImage)
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
.bg {
  background-repeat: no-repeat;
  background-size: 100vw 100vh;
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
  align-items: center; /* To vertically center the content */
}

.flex-container button {
  margin-right: 10px; /* Adjust the spacing between the button and h1 as needed */
}



.Icon {
  position: absolute;
  top: 0;
  left: 0;
  margin: 20px; /* Adjust the margin as needed */
}

.container {
  position: relative;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
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
    <button class="button" on:click={() => pop()}>
      <img style="width: 5vw" src="build/images/Arrow_icon.svg">
    </button>
  </div>
  </div>
  <LSGCalendar></LSGCalendar>
  <LeakWindow></LeakWindow>
</div>

  

