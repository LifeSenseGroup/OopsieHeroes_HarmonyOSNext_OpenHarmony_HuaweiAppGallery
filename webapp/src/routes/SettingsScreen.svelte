<script lang="ts">

import { _ } from 'svelte-i18n'
import { locale, locales } from 'svelte-i18n'
import { onMount , onDestroy } from 'svelte';
import { pop} from 'svelte-spa-router'
import {setSound1,setSound2,setSound3,setSound4,setSound5, setSoundCustom, recordSound,stopRecordSound} from '../utils/NativeBridge'
import {store_smallOrLargeImageTxt} from '../stores'
import {store_selectedSound} from '../stores';
var backgroundImage = "";


var recording = false;
let isVoiceRecordingSelected = false;
console.log("loading")

	onMount( 
         () => {
			 recording = false;  
       console.log("mounted")
       backgroundImage = "build/images/background_intro_" +  $store_smallOrLargeImageTxt + ".jpg"

	  
    });

    onDestroy(() => {
      try {
      } catch (error) {
        console.error(error);
      }
     });
</script>   
    
   



<style>
/* grid.layoutit.com?id=SeYwZIY   ,  grid.layoutit.com?id=BZ9F69B
    grid.layoutit.com?id=aQfE3UT */

.container {  display: grid;
  grid-template-columns: minmax(0, 0.1fr) minmax(0, 1.5fr) minmax(0, 0.1fr);
  grid-template-rows: minmax(0, 0.3fr) minmax(0, 0.5fr) minmax(0, 1fr) minmax(0, 2.6fr) minmax(0, 0.9fr) minmax(0, 0.9fr);
  gap: 2px 2px;
  grid-auto-flow: row;
  justify-content: center;
  /*align-content: space-evenly;
  justify-items: stretch;*/
  align-items: center;
  grid-template-areas:
    "Margin Margin Margin"
    "Arrow Title ."
    ". Top-Spacer ."
    ". GridContainerSelections ."
    ". Footer ."
    ". . .";
}

.Margin {
  grid-area: Margin;
  width: 100%;
  height: 100%;
}


.Arrow {
  grid-area: Arrow;
}

.Title {
  grid-area: Title;
  width: 100%;
  height: 100%;
}

.Top-Spacer {
  grid-area: Top-Spacer;
  width: 100%;
  height: 100%;
}

.GridContainerSelections {  
  grid-area: GridContainerSelections;
  display: grid;
  grid-template-columns:  minmax(0, 0.2fr)  minmax(0, 3.1fr) minmax(0, 0.5fr) minmax(0, 0.2fr);
  grid-template-rows: minmax(0, 0.9fr) minmax(0, 1.1fr) minmax(0, 1.1fr) minmax(0, 1.1fr) minmax(0, 1.1fr) minmax(0, 1.1fr) minmax(0, 1.1fr) minmax(0, 1.1fr);
  gap: 12px 6px;
  grid-template-areas:
    ". GridchoiceTxt GridchoiceTxt ."
    ". smooth smooth ."
    ". phone phone ."
    ". rooster rooster ."
    ". harsh harsh ."
    ". oopsieheroes oopsieheroes ."
    ". record-txt record-txt ."
    ". voice iconSpace .";
 
  width: 100%;
  height: 100%;
  text-align: center;
  text-decoration-color: white;
  background-color: rgba(0,0,154,0.2);   /* https://www.colorhexa.com/000080    (semi-transparent background)
                                              Do not use opacity,  http://hex.wikimix.info/en/color-030764  */
  } 
  

.voice { grid-area: voice; }

.iconSpace { 
  grid-area: iconSpace;
  width: 100%;
  height: 100%;
 }

.record-txt { grid-area: record-txt; }

.oopsieheroes { grid-area: oopsieheroes; }

.harsh { grid-area: harsh; }

.rooster { grid-area: rooster; }

.phone { grid-area: phone; }

.smooth { 
  grid-area: smooth;}

.GridchoiceTxt { grid-area: GridchoiceTxt; 
  /*font-size: 1.1em; 
  font-size: 14.8px;*/
  width: 100%;
  height: 100%;
  color: white;
 /*font-family: 'Rubik';   Rubik (font-family) does not work for the same font-style of old oopsie*/
 font-family: Arial;
}


.Footer {
  grid-area: Footer;
  width: 100%;
  height: 100%;
}

/* end container from grid layout */
.center {
    display: flex;
    justify-content: center;
    align-items:  center;
  }

  .bg{
    background-repeat: no-repeat;
    background-size: 100vw 100vh; 
  }

  h1 {
    color: white;
    text-align: center;
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

  .btn-group{
    width:100% ; 
    color: white; 
    border-radius: 20px; 
    height:100%;
   
    }

  .Arrow {
  grid-area: Arrow;
  margin-top: 30px;
  }

  .record-txt {
  grid-area: record-txt;
 /* font-size: 1.1em;
  font-size: 14.3px;
 /* margin-bottom: 20px;
  font-family:'Rubik-Medium';*/
  font-family: Arial;
}


</style>


<div class="container bg" style="height : 100%; width:100%; background-image: url({backgroundImage});">
  <div class="Margin"></div>
  <div class="Arrow center">
    <button class="button" on:click={() => pop()}> 
    <img  style="width:4vw" src="build/images/Arrow_icon.svg"  alt={$_("a11y.back")} width=100%> 
    </button>  
  </div>

  <div class="Title center" style = "font-family: Arial;">
    <h1 style = "font-family: Arial; font-size: 20px;">
    {$_('SettingsScreen.Alarm Settings')}
    </h1>
  </div>

  <div class="Top-Spacer"></div>

  <div class="GridContainerSelections" style = "width: 100%; height:155%">
   <div class="GridchoiceTxt" style= "font-family: Arial; font-size: 13.8px; width:100%; height: 100%; text-align: left; color: white">
    {$_('SettingsScreen.Choose your alarm sound')} 
    </div>

      
        <div class="smooth" style = "font-family: Arial; font-size: 15.3px; width:100%; height: 100%">
      <button  class="btn-group center" on:click = {() => {
        setSound1(); 
        $store_selectedSound = 1;
        }} 
        style = "font-family: Arial; font-size: 15.3px; background-color: {$store_selectedSound==1 ? '#00008B' : 'skyblue'}; ">
        {$_('SettingsScreen.Smooth & Gentle')}
       {#if  $store_selectedSound==1} 
        &nbsp;&nbsp;&#10003;
      {/if} 
      </button>
     </div>

      <button class="phone btn-group center" on:click={() => {setSound2();
        $store_selectedSound = 2;

       
       
       
      }} style = "font-family: Arial; font-size: 15.3px; background-color: {$store_selectedSound == 2 ? '#00008B' : 'skyblue'}; ">
        {$_('SettingsScreen.Phone-like')}

        
       
        {#if  $store_selectedSound == 2}
        &nbsp &nbsp;&nbsp; &nbsp;&nbsp;&#10003;
        {/if}
       </button>

      <button class="rooster btn-group center" on:click={() => {setSound3(); 
        $store_selectedSound = 3;
        
       
        }} style = "font-family: Arial; font-size: 15.3px; background-color: {$store_selectedSound == 3 ? '#00008B' : 'skyblue'}; ">
        {$_('SettingsScreen.Rooster')}
        {#if  $store_selectedSound == 3}
        &nbsp &nbsp;&nbsp; &nbsp;&nbsp;&#10003;
        {/if}
      </button> 

      <button class=" harsh btn-group center" on:click={() => {setSound4(); 
        $store_selectedSound = 4;
        
       
        }} style = "font-family: Arial; font-size: 15.3px; background-color: {$store_selectedSound == 4 ? '#00008B' : 'skyblue'}; ">
        {$_('SettingsScreen.Harsh alarm')}
       {#if  $store_selectedSound == 4}
        &nbsp &nbsp;&nbsp; &nbsp;&nbsp;&#10003;
        {/if}
      </button> 

      <button class="oopsieheroes btn-group center" on:click={() => {setSound5(); 
        $store_selectedSound = 5;
        
        
        }} style = " font-family: Arial; font-size: 14.8px; background-color: {$store_selectedSound == 5 ? '#00008B' : 'skyblue'}; ">
        {$_('SettingsScreen.Oopsie Heroes')}
        {#if  $store_selectedSound == 5}
         &nbsp;&nbsp;&#10003;
        {/if}
      </button> 

      
    
    <div class="record-txt" style= " font-family: Arial; font-size: 13.6px; width:80%; height: 100%; text-align: left; color: white" >
      {$_('SettingsScreen.Record the voice of one of your parents:')} 
    </div>
  
    
     <button class="voice btn-group" on:click={() => {
      setSoundCustom();
      $store_selectedSound = 6;
     }}  
      style = "font-family: Arial; font-size: 14px; background-color: {$store_selectedSound == 6 ? '#00008B' : 'skyblue'}; ">
      {$_('SettingsScreen.Voice recording')}  
      {#if $store_selectedSound == 6}
      &nbsp;&#10003;
      {/if}
     </button>
     {#if recording}
        <img  class="iconSpace"  on:click={() => { recording= false ; stopRecordSound() }}  src="build/images/stop_recording.svg"  alt={$_("a11y.microphone")}> 
     {:else}
        <img  class="iconSpace"  on:click={() => { recording = true ;    setTimeout(() => {
          recording = false;
          console.log("Recording stopped");
        }, 3000); recordSound(); }}  src="build/images/microphone.svg"  alt={$_("a11y.microphone")}> 
     {/if}

 

</div>

</div>





