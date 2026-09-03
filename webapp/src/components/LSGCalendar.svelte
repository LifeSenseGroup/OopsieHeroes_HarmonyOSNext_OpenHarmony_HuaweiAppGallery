<script lang="ts">
	import Calendar from "./Calendar.svelte";
	import {getLeaks, getStarts} from "../utils/dataStorage";
	import {parseLeaksIntoItems, parseDryNightsIntoStarItems, getDryNights} from "../utils/utils"
	import {createEventDispatcher, onMount} from 'svelte';
	import {currentSelectedDate} from "../stores"
	import  {  CalendarItem } from '../utils/dataStructures';
	import { _ } from "svelte-i18n";
    import { locale, locales } from "svelte-i18n";

	//var dayNames = [$_("CalendarScreen.Mon"), $_("CalendarScreen.Tue"), $_("CalendarScreen.Wed"), $_("CalendarScreen.Thu"), $_("CalendarScreen.Fri"), $_("CalendarScreen.Sat"), $_("CalendarScreen.Sun")];
	var dayNames = [$_("CalendarScreen.Sun"), $_("CalendarScreen.Mon"), $_("CalendarScreen.Tue"), $_("CalendarScreen.Wed"), $_("CalendarScreen.Thu"), $_("CalendarScreen.Fri"), $_("CalendarScreen.Sat")];
	
	let monthNames = [$_("CalendarScreen.January"), $_("CalendarScreen.February") , $_("CalendarScreen.March") , $_("CalendarScreen.April"), $_("CalendarScreen.May"), $_("CalendarScreen.June"), $_("CalendarScreen.July"), $_("CalendarScreen.August"), $_("CalendarScreen.September"), $_("CalendarScreen.October"), $_("CalendarScreen.November"),$_("CalendarScreen.December")];

	let headers = [];
	let now = new Date();
	let year = now.getFullYear();		//	this is the month & year displayed
	let month = now.getMonth();
	let eventText="";

	var days = [];	//	The days to display in each box

	function randInt(max) {
		return Math.floor(Math.random()*max)+1;
	}
	
	//	The Calendar Component just displays stuff in a row & column. It has no knowledge of dates.
	//	The items[] below are placed (by you) in a specified row & column of the calendar.
	//	You need to call findRowCol() to calc the row/col based on each items start date. Each date box has a Date() property.
	//	And, if an item overlaps rows, then you need to add a 2nd item on the subsequent row.
	var items = [];


	onMount( 
         () => {
		
		 });

	function initMonthItems() {
	items = [];
    let y = year;
    let m = month;
    let d1 = new Date(y, m, randInt(7) + 7);

	let item: CalendarItem = {
             date: $currentSelectedDate,
             len: 1,
             title: "circle",
             className: "task--primary"
         };
    items.push(item);
	for (let i of items) {
                let rc = findRowCol(i.date);
                if (rc == null) {
                    console.log('didn`t find date for ', i);
                    console.log(i.date);
                    console.log(days);
					i.title = "";
                    i.startCol = i.startRow = 0;
                } else {
                    i.startCol = rc.col;
                    i.startRow = rc.row;
                }
            }
	
	getDryNights()
		.then(drys => {


            items = [...items,...parseDryNightsIntoStarItems( drys,month)]

            // This is where you calc the row/col to put each dated item
            for (let i of items) {
                let rc = findRowCol(i.date);
                if (rc == null) {
                    console.log('didn`t find date for ', i);
                    console.log(i.date);
                    console.log(days);
                    i.startCol = i.startRow = 0;
                } else {
                    i.startCol = rc.col;
                    i.startRow = rc.row;
                }
            }
        })
        .catch(error => {
            console.error("Error fetching drys:", error);
        });

    // get the latest leak events
    getLeaks()
        .then(leaks => {
            items = [...items,...parseLeaksIntoItems( leaks,month)]

            // This is where you calc the row/col to put each dated item
            for (let i of items) {
                let rc = findRowCol(i.date);
                if (rc == null) {
                    console.log('didn`t find date for ', i);
                    console.log(i.date);
                    console.log(days);
                    i.startCol = i.startRow = 0;
                } else {
                    i.startCol = rc.col;
                    i.startRow = rc.row;
                }
            }
        })
        .catch(error => {
            console.error("Error fetching leaks:", error);
        });
}

	
    // we also added currentSelectedDate, if the user selects a new date the screen will flash because it will build it up again.
	// if on some systems this gives problem remove the currentSelectedDate. The circel will not move anymore to another date but that might be better then the refresh
	$: month,year,$currentSelectedDate, initContent();

	// choose what date/day gets displayed in each date box.
	function initContent() {
		headers = dayNames;
		initMonth();
		initMonthItems();
	}

	function initMonth() {
		days = [];
		let monthAbbrev = monthNames[month].slice(0,3);
		let nextMonthAbbrev = monthNames[(month+1)%12].slice(0,3);
		//	find the last Monday of the previous month
		var firstDay = new Date(year, month, 1).getDay();
		//console.log('fd='+firstDay+' '+dayNames[firstDay]);
		var daysInThisMonth = new Date(year, month+1, 0).getDate();
		var daysInLastMonth = new Date(year, month, 0).getDate();
		var prevMonth = month==0 ? 11 : month-1;
		
		//	show the days before the start of this month (disabled) - always less than 7
		for (let i=daysInLastMonth-firstDay;i<daysInLastMonth;i++) {
			let d = new Date(prevMonth==11?year-1:year,prevMonth,i+1);
			days.push({name:''+(i+1),enabled:false,date:d,});
		}
		//	show the days in this month (enabled) - always 28 - 31
		for (let i=0;i<daysInThisMonth;i++) {
			let d = new Date(year,month,i+1);
			if (i==0) days.push({name:monthAbbrev+' '+(i+1),enabled:true,date:d,});
			else days.push({name:''+(i+1),enabled:true,date:d,});
			//console.log('i='+i+'  dt is '+d+' date() is '+d.getDate());
		}
		//	show any days to fill up the last row (disabled) - always less than 7
		for (let i=0;days.length%7;i++) {
			let d = new Date((month==11?year+1:year),(month+1)%12,i+1);
			if (i==0) days.push({name:nextMonthAbbrev+' '+(i+1),enabled:false,date:d,});
			else days.push({name:''+(i+1),enabled:false,date:d,});
		}
	}

	function findRowCol(dt) {
		for (let i=0;i<days.length;i++) {
			let d = days[i].date;
			if (d.getYear() === dt.getYear()
				&& d.getMonth() === dt.getMonth()
				&& d.getDate() === dt.getDate())
				return {row:Math.floor(i/7)+2,col:i%7+1};
		}
		return null;	
	}
	


	function itemClick(e) {
		
	}
	function dayClick(e) {
		$currentSelectedDate = e.date;
		
	}
	function headerClick(e) {
		
	}
	function next() {
		month++;
		// Increase the date by 1 month
		//$currentSelectedDate.setMonth($currentSelectedDate.getMonth() + 1);

        items = [];  // reset items here already so we get no timing issues later on
		if (month == 12) {
			year++;
			month=0;
		}
	}
	function prev() {
		// Increase the date by 1 month
		//$currentSelectedDate.setMonth($currentSelectedDate.getMonth() - 1);
       items = []; // reset items here already so we get no timing issues later on
		if (month==0) {
			month=11;
			year--;
		} else {
			month--;
		}
	}
	
</script>

<div class="calendar-container" style=" font-family: Arial;">
  <div class="calendar-header">
    <h1>
      
      <button style=" font-family: Arial;font-size: 12px; background-color: transparent; color: white" on:click={()=>prev()}>&lt;</button>
       {monthNames[month]} {year}
      <button style=" background-color: transparent; color: white" on:click={()=>next()}>&gt;</button>

    </h1>
	
	</div>

	<Calendar
		{headers}
		{days}
		{items}
		on:dayClick={(e)=>dayClick(e.detail)}
		on:itemClick={(e)=>itemClick(e.detail)}
		on:headerClick={(e)=>headerClick(e.detail)}
		/>
</div>
	
<style>
.calendar-container {
  width: 90%;
  margin: auto;
  overflow: hidden;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  /*background: #fff; */
  max-width: 1200px;
  background-color: rgba(14, 22, 47, 0.9);
}
.calendar-header {
  text-align: center;
  padding: 20px 0;
 /*  background: #eef;  */
color: grey;
  border-bottom: 1px solid rgba(166, 168, 179, 0.12);
}
.calendar-header h1 {
  margin: 0;
  font-size: 15px;
  
}
.calendar-header button {
 /* background: #eef; */
  border: 1px ;
  padding: 6;
 /* color: rgba(81, 86, 93, 0.7); */
  cursor: pointer;
  outline: 0;
}
</style>