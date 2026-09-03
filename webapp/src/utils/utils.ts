import type { EventOopsie, CalendarItem } from './dataStructures';
import {getStarts, getLeaks, getStops} from './dataStorage';
import {store_min_minutes_valid_night} from '../stores';

let store_min_minutes_valid_nightValue;

store_min_minutes_valid_night.subscribe(value => {
    store_min_minutes_valid_nightValue = value;
});

// phone or tablet 
export function isSmallScreen() {

    var retVal = true;
    let height = window.innerHeight;
    let width = window.innerWidth;
    let ratio = height / width
  
    if (ratio > 1.6) {
      retVal =  true
    } else {
      retVal = false
    }
    return retVal;
  }

export function getCustomDateRaw(date: Date): Date {
    if (!(date instanceof Date)) {
        console.error("Invalid date provided:", date);
        return date; // or handle this case as you see fit
    }
    const nextDay = new Date(date);
    if (date.getHours() >= 18) {
        nextDay.setDate(date.getDate() + 1);
    }
    return nextDay;
}



 function getCustomDate(date: Date): string {
    if (!(date instanceof Date)) {
        console.error("Invalid date provided:", date);
        return ""; // or handle this case as you see fit
    }
    const nextDay = new Date(date);
    if (date.getHours() >= 18) {
        nextDay.setDate(date.getDate() + 1);
    }
    return nextDay.toDateString();
}

export async function getLeaskOnDate(date: Date): Promise<EventOopsie[]>
{
   const leaks:EventOopsie[] = await getLeaks();
   const leaksForThisNight: EventOopsie[] = leaks.filter(event => 
        getCustomDate(event.date) === date.toDateString()
    );

    return leaksForThisNight;
}

export async function getWetNights():Promise<EventOopsie[]>{
    const  leakNights: EventOopsie[] = await getLeaks();
    // remove double start events at the same day
    const uniqueleakNights: EventOopsie[] = leakNights.filter
    ( (event, index, self) => 
        index === self.findIndex(e => getCustomDate(e.date) === getCustomDate(event.date))
    );

    return uniqueleakNights;
}

export async function getMeasuredNights():Promise<EventOopsie[]>
{
   // const db = await openDBlocal('oopsie', 1);
   // const events = await db.getAll('events');
   
   // db.close();
    // loop over events and filter leak events 
    //const measuredNights: EventOopsie[] = events.filter(event => event.value.type === eTypes.MEASURINGDAY_STARTED);

    const  measuredNights: EventOopsie[] = await getStarts();
    const  stops: EventOopsie[] = await getStops();

    // remove double start events at the same day
    const uniqueMeasuredNights: EventOopsie[] = measuredNights.filter
    ( (event, index, self) => 
        index === self.findIndex(e => getCustomDate(e.date) === getCustomDate(event.date))
    );

     // Extract the dates from leaksNights
     var stopDates = stops.map(item => getCustomDate(item.date)); // toDateString());

    var filteredNights = uniqueMeasuredNights.filter(item => stopDates.includes( getCustomDate(item.date)));

    return filteredNights;
};

export async function getDryNights(){
    // if start happend and no leak , then it was a dry night so a star
    var measuringNights = await getMeasuredNights();
    var leaksNights = await getWetNights();

    // Extract the dates from leaksNights
    var leaksDates = leaksNights.map(item => item.date.toDateString());

    // Filter out items from measuringNights that have dates not present in leaksDates
    var filteredNights = measuringNights.filter(item => !leaksDates.includes(item.date.toDateString()));

    // filteredNights now contains items from measuringNights with dates not present in leaksDates
 
    return filteredNights;
}

export async function getLevel():Promise<number>{
    // see how many dry nights are there and divide by 2
    // there are 14 levels so 30 dry night will reach the maximum level
 
     var dryNights = await getDryNights()
     let dryNightsNr = dryNights.length;
     var level = Math.floor(dryNightsNr / 2);
     level = level + 1 // start with level 1 not 0
 
     if (level < 1)
       level = 1;
     if (level > 14)
       level = 14
     return level;
   
   }


function areDatesSameDay(date1:Date, date2:Date):boolean {
        var retVal:boolean = false;

        if (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        ) {retVal = true}
        return retVal;
    }

    // export function dayIsaStar(date):boolean {
    
    //      getDryNights().then(dryNights => {
    //         const onlyThisDay = dryNights.filter(dry => 
    //             areDatesSameDay(new Date(getCustomDate(dry.date)), date)
    //         );
    
    //         if (onlyThisDay.length > 0) {
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     });
    // }

    
export async function dayIsaStar(date:Date):Promise<boolean> {

    var retVal = false;

    var dryNights = await getDryNights();
    const onlyThisDay: EventOopsie[] = dryNights.filter(dry => 
        areDatesSameDay( new Date(getCustomDate(dry.date)),date)
    );

    if (onlyThisDay.length > 0) {
        return true;
    }
    else
      {return false;}

}

// calendar needs calendar Items 

export function parseDryNightsIntoStarItems(drys:EventOopsie[],month:number)
{
     // filter only this month leaks

     var items:CalendarItem[] = [];

     const onlyThisMonth: EventOopsie[] = drys.filter(dry => 
         new Date(getCustomDate(dry.date)).getMonth() === month
     );
     
     // convert leak dates to the custom date so > 18:00 is the next day
     for (let dry of onlyThisMonth) {
         const nextDay = new Date(dry.date);
         if (dry.date.getHours() >= 18) {
             nextDay.setDate(dry.date.getDate() + 1);
         }
         dry.date = nextDay;
     }
     
     // convert to items strings like :  {title:"star", className:"task--primary", date:new Date(y,m,randInt(6)),len:1}
     for (let dry of onlyThisMonth) {
         let item: CalendarItem = {
             date: dry.date,
             len: 1,
             title: "star",
             className: "task--primary"
         };
         items.push(item);
     }
  
     return items
}

// we use month for now, if a customer would use it for 1 year or more it could give problems. (but nodody does !?)
export function parseLeaksIntoItems(leaks:EventOopsie[],month:number)
{
    // filter only this month leaks

    var items:CalendarItem[] = [];

    const onlyThisMonth: EventOopsie[] = leaks.filter(leak => 
        new Date(getCustomDate(leak.date)).getMonth() === month
    );
    
    // convert leak dates to the custom date so > 18:00 is the next day
    for (let leak of onlyThisMonth) {
        const nextDay = new Date(leak.date);
        if (leak.date.getHours() >= 18) {
            nextDay.setDate(leak.date.getDate() + 1);
        }
        leak.date = nextDay;
    }
    
    // convert to items strings like :  {title:"star",className:"task--primary",date:new Date(y,m,randInt(6)),len:1}
    for (let leak of onlyThisMonth) {
        let item: CalendarItem = {
            date: leak.date,
            len: 1,
            title: "leak",
            className: "task--primary"
        };
        items.push(item);
    }
    
   
    return items
}

// Function to validate email format
export function validateEmail(userEmail: string) {

    var emailOK = false;

    // Regular expression for validating email addresses
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
    if (emailRegex.test(userEmail)) {
      // Email is valid
      emailOK = true;  
    }
    return emailOK;
  }


  export function checkEventsAre_X_minApart(date1:Date, date2:Date) {
    if (date1.getTime()==0 || date2.getTime()==0) return false;

    const differenceInMilliseconds: number = Math.abs(date2.getTime() - date1.getTime());
    const differenceInMinutes: number = differenceInMilliseconds / (1000 * 60);
    return differenceInMinutes >= store_min_minutes_valid_nightValue;
  }