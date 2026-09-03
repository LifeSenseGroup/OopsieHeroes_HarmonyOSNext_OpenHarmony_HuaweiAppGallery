<script lang="ts">
    import { _ } from "svelte-i18n";
    import { locale, locales } from "svelte-i18n";
    import { onMount, onDestroy } from "svelte";
    import ButtonWithIcon from '../components/ButtonWithIcon.svelte'
    import { store_smallOrLargeImageTxt } from '../stores.js'
    import { pop, push} from 'svelte-spa-router'
    import {getMeasuredNights, getLevel, isSmallScreen} from "../utils/utils"
    import {TEST_createSomeEventsThisMonthAndStoreInLocalDB} from "../utils/tests"

 
    
    let backgroundImage_url = "";
    var myScreenOrientation = window.screen.orientation;
   
    try {
    myScreenOrientation.lock("portrait"); // prevent from rotating screen
    } catch (error) {
    console.error(error);
    }

    console.log("loading")
 

    onMount( 
      () => {
			 let imagePrefix = "build/images/backgrounds/"
       backgroundImage_url = imagePrefix + "Star" + ".svg" 
       console.log("mounted")

       setTimeout(() => {
      // Transition back to the home screen
      push('#/');
      }, 2000);  //After 2 seconds, the star screen (stays 2 sec) will automatically be disappreared and homeScreen will be appeared again

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
  .starScreen {
    background-size: cover; 
    background-repeat: no-repeat; 
    width: 100%;
    height: 100%;
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
  </style>

<div class="starScreen" style="background-image: url({backgroundImage_url});">
    <div class="Margin"></div>
  
  </div>

  