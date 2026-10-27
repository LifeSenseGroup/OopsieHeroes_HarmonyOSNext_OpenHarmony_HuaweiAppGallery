<script lang="ts">
  import { _ } from "svelte-i18n";
  import { locale, locales } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";
  import { deleteEventLocal } from "../utils/dataStorage";
  import {EventOopsie} from "../utils/dataStructures";
  import { currentSelectedDate } from "../stores";
  import { onMount } from "svelte";
  import {getLeaskOnDate, dayIsaStar, getMeasuredNights, getDryNights} from "../utils/utils"

  const dispatch = createEventDispatcher();

  var datum = "2023-04-14";
  $: list = []
  var isStar = false;

  function getDateStrAndSetupLeakList() {
    var Str;
    var Month = $currentSelectedDate.getMonth()+1;  // getMonth start with 0 for januari
    Str = $currentSelectedDate.getFullYear() + '-' + Month + '-' + $currentSelectedDate.getDate();

    list = []; // reset list again, since this is a another day
    getLeaskOnDate($currentSelectedDate).then(leakList => {
      if (leakList.length > 1 )
      {console.log("list lenght :",leakList.length)}
      for (let leak of leakList)
      {
        let hours = String(leak.date.getHours()).padStart(2, '0');
        let minutes = String(leak.date.getMinutes()).padStart(2, '0');
        let str = hours + ":" + minutes;
       //  let str = leak.date.getHours() + ":" + leak.date.getMinutes();
         list = [...list, str];  // Use the spread operator to create a new reference
       }
    });
    return Str;
  }

  var measuredNrNights;
  var dryNrNights;
  var percentage;
  
  // reactive statements
  $: dateStr = getDateStrAndSetupLeakList($currentSelectedDate);
  $: dayIsaStar($currentSelectedDate).then(val =>{ isStar = val });


  export let onButtonClick =
  () => {}; /* function that is called when the div/button is clicked, empty for now */

  function test() {
    console.log("test");
    dispatch("click");}

  onMount(() => {
  getMeasuredNights()
    .then(measuredNights => {
      measuredNrNights = measuredNights.length;
      if (measuredNrNights == 0)
        measuredNrNights = 1;  // prevent div by 0
      return getDryNights();
    })
    .then(dryNights => {
      dryNrNights = dryNights.length;
      percentage = 100 + Math.floor(((dryNrNights / measuredNrNights) - 1 ) * 100);
      // Use 'percentage' as needed here
    })
    .catch(error => {
      console.error("Error:", error);
    });
});

//delete the leakage date time when delete_icon is clicked
// Define the function to delete an item from the list
function deleteLeak(index: number) {
// Convert $currentSelectedDate to a Date object
const currentDate = new Date($currentSelectedDate);

// Split the time string into hours and minutes
const timeParts = list[index].split(':');
const hours = parseInt(timeParts[0]);
const minutes = parseInt(timeParts[1]);
  
 // Set the time on the currentDate object
 currentDate.setHours(hours, minutes, 0, 0); // Clear seconds and milliseconds

// Convert the merged date and time back to a string
const selectedDate = currentDate// .toISOString();

// Create a new EventOopsie object with the selected date
const oopsieEvent: EventOopsie = {
    date: selectedDate,};

    deleteEventLocal(oopsieEvent)
    .then(() => {
      // Remove the item from the list based on its index
      list = list.filter((_, i) => i !== index);
      $currentSelectedDate = $currentSelectedDate;  // force refresh 
    })
    .catch((error) => {
      // Handle errors if deleteEventLocal fails
      console.error(error);
    });

    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
}

 function myFunction() {
  var popup = document.getElementById("myPopup");
  if (popup.style.display === 'none' || popup.style.display === '') {
    popup.style.display = 'block';
    popup.classList.add("show");
  } else {
    popup.style.display = 'none';
    popup.classList.remove("show");
  }}

function handleYesClick(index) {
  // Perform the action when the "Yes" button is clicked
  deleteLeak(index); // call a delete function
//  closePopup();
}

function handleNoClick() {
  // Perform any action when the "No" button is clicked
  closePopup();// simply close the popup
}

function closePopup() {
  var popup = document.getElementById("myPopup");
  popup.classList.remove("show");
  popup.style.display = 'none';
}
</script>


<div class = "heroTxt" style = "font-family: Arial;">
  {#if isStar==true}
        {$_("CalendarScreen.You’re a superstar!")}! 
         <br />
     {$_("CalendarScreen.No wet events this day")}
  {/if}
</div>
<br>
<div class="container" style = "font-family: Arial;font-size: 12.8px; ">
  <div class="containerGrid">
    <div class="percentage" >
      {$_("CalendarScreen.PERCENTAGE DRY NIGHTS")}
      <br /> {percentage}%
    </div>
    <div class="aantal">
      {$_("CalendarScreen.TOTAL STARS EARNED")}
      <br />
      {dryNrNights}
    </div>
  </div>
  <div class="stats-outlook-wrap">
    <slot name="after-stats"></slot>
  </div>

  <ul>
    {#each list as item, i}
      <li>
        <div class="containerLeak">
          <div class="datum">
            {dateStr}
          </div>
          <div class="time">{item}</div>
          <div class="icon" >
         

  <div class="popup" style = "font-family: Arial;">
  <img on:click|stopPropagation={() => myFunction()} style="height:2vh; color:white" src="build/images/Delete_icon.svg" />
  <div class="popuptext" id="myPopup">
    {$_("CalendarScreen.Do you really want delete this event?")}
    <div class="popup-buttons">
      <button on:click={() => handleYesClick(i)}>{$_("Yes")}</button>
      <button on:click={() => handleNoClick()}>{$_("No")}</button>
    </div>
  </div>
  </div>
  </div>
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
 .popup {
  position: relative;
  display: inline-block;
  max-width: 100%;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* The actual popup */
 .popup .popuptext {
  visibility: visible;
  min-width: 200px;
  max-width: 400px;
  max-height: 200px;
  display: none;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 16px;
  position: absolute;
  z-index: 1;
  bottom: 115%;
  left: 50%;
  margin-left: -146px;
}

 .popup .popup-buttons {
  display: flex; /* Make the buttons appear in a row */
  justify-content: center; /* Center the buttons horizontally */
  margin-top: 10px; /* Add some space between the text and buttons */
}

 .popup .popup-buttons button {
  margin: 0 10px; /* Add some space between the buttons */
}

/* Popup arrow */
 .popup .popuptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

/* Media query for smaller screens */
@media (max-width: 768px) {
  .popup .popuptext {
    left:-20%; 
  }
}

@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity:1 ;}
}

 .heroTxt{
    text-align: center;
    font-size: 1.2rem;
    color: white;
  }

  .container {
    width: 90%;
    height: 25vh;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    background-color: rgba(14, 22, 47, 0.2);
  }

  .containerGrid {
    margin-top: 0.5vh;
    text-align: center;
    /*font-size: 1.2rem;*/
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1.2fr);
    grid-template-rows: minmax(0, 0.1fr) minmax(0, 2.8fr) minmax(0, 0.1fr);
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      ". ."
      "percentage aantal"
      ". .";
  }

  .percentage {
    grid-area: percentage;
    color: white;
  }

  .aantal {
    grid-area: aantal;
    color: white;
  }

  .stats-outlook-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .containerLeak {
    margin-top: 1vh;
    color: white;
    display: grid;
    grid-template-columns: 0.9fr 2.1fr 0.4fr;
    grid-template-rows: 0.1fr 2.8fr 0.1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      ". . ."
      "datum time icon"
      ". . .";
  }

  .datum {
    grid-area: datum;
    text-align: center;
  }

  .time {
    grid-area: time;
  }

  .icon {
    grid-area: icon;
  }
</style>