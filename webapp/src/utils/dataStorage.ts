// for storing data on this phone 

import { openDB as openDBlocal } from 'idb';

import { EventOopsie, UserData, eTypes } from './dataStructures';
import { store_selectedSound, store_onBoardingDone, store_customer_country, store_customer_email,  store_customer_age, store_customer_sex, txtSndfilename, txtVibrate} from '../stores'
import { get } from 'svelte/store';
import {setSndFile} from './NativeBridge'
import {setVibrate} from './NativeBridge'
import {getCustomDateRaw} from './utils'

export let dataStorage_blockWriteToDB = true;
export let globalSyncLock = false;
export function setDataStorageBlockWriteToDB(value: boolean) {
dataStorage_blockWriteToDB = value;
}

export async function initDBs(){

openDBlocal('oopsie', 1, {   // 'oopsie' is the name of the database , the number is the version change it if you change the structure of the DB upgrade is called then
  upgrade(db) {
    db.createObjectStore('settings', { keyPath: 'id' });
    db.createObjectStore('events', { keyPath: 'id' });
    db.createObjectStore('user', { keyPath: 'id' , autoIncrement:false });

  },
});
}


export async function clearEventsLocalDB() {
  const db = await openDBlocal('oopsie', 1);
  db.clear('events');
}

export async function storeGetSettingInfo(): Promise<any> {
  const db = await openDBlocal('oopsie', 1);
  const settings = await db.getAll('settings');

 
  if (settings.length > 0) {
    // @ts-ignore

      var len = settings.length;
     // ignore typescript error
      for (var i=0;i<len;i++) {
        var infoElement = settings[i];

        // @ts-ignore
        if (typeof infoElement.id != 'undefined') {
          if ( infoElement.id == 'txtSndfilename') {
             // @ts-ignore
             txtSndfilename.set(infoElement.value);
          }

          if ( infoElement.id == 'txtVibrate') {
            // @ts-ignore
            txtVibrate.set(infoElement.value);
         }

          if ( infoElement.id == 'store_onBoardingDone') {
            // @ts-ignore
            store_onBoardingDone.set(infoElement.value);
         }
        
          
         
        }
      
      }
     console.log(get(txtSndfilename));
     console.log(get(txtVibrate));
     }
    db.close();
}

export async function storeGetUserInfo(): Promise<any> {
  const db = await openDBlocal('oopsie', 1);

  const userInfo = await db.getAll('user');

  if (userInfo.length > 0) {
    // @ts-ignore
    //await storeUserInfo(events)
      var len = userInfo.length;
     // ignore typescript error
      for (var i=0;i<len;i++) {
        var infoElement = userInfo[i];

        // @ts-ignore
        if (typeof infoElement.id != 'undefined') {
          if ( infoElement.id == 'email') {
             // @ts-ignore
             store_customer_email.set(infoElement.value);
          }
          if ( infoElement.id == 'sex') {
            // @ts-ignore
            store_customer_sex.set(infoElement.value);
          }
          if ( infoElement.id == 'age') {
            // @ts-ignore
            store_customer_age.set(infoElement.value);
          }
          if ( infoElement.id == 'country') {
            // @ts-ignore
            store_customer_country.set(infoElement.value);
          }
        
        }
      
      }
     console.log(get(store_customer_email));

  } 
  else // only for debugging
  {
  //  store_weeknr.set(1)
  //  var a ={"age" : 3, "weeknr":1};

  }
  db.close();
  
  return userInfo;
}

export async function storeUserVal(idStr: string, val: any)
{

  if (!dataStorage_blockWriteToDB)
  {
    const db2 = await openDBlocal('oopsie', 1);
    await db2.put('user', { id: idStr, value: val });
    await db2.put('user',{id: "savedToDB", value: false})
    db2.close();
  }
}

export async function storeSettingsVal(idStr: string, val: any)
{

  if (!dataStorage_blockWriteToDB)
  {
    const db2 = await openDBlocal('oopsie', 1);
    await db2.put('settings', { id: idStr, value: val });

    db2.close();
  }
}

export async function storeVallocal(idStr: string, val: number) {

  if (!dataStorage_blockWriteToDB)
  {
    var i: Number = 1;

    const db2 = await openDBlocal('oopsie', 1);
    db2.put('settings', { id: idStr, value: val });
    db2.close();

    return i;
  }
}


export async function getLeaks():Promise<EventOopsie[]> {
  const db = await openDBlocal('oopsie', 1);
  const events = await db.getAll('events');
 
  db.close();
   // loop over events and filter leak events 
   var leaks: any[] = events.filter(event => event.value.type === eTypes.LEAK);
   // we get now something like this : {id: 3, value: {…}}  , so only get value, this contains the EventOopsie structure
   leaks = leaks.map(item => item.value);

  return leaks;
}


export async function getStarts():Promise<EventOopsie[]> {
  const db = await openDBlocal('oopsie', 1);
  const events = await db.getAll('events');
 
  db.close();
   // loop over events and filter leak events 
  var starts: any[] = events.filter(event => event.value.type === eTypes.MEASURINGDAY_STARTED);
    // we get now something like this : {id: 3, value: {…}}  , so only get value, this contains the EventOopsie structure
  starts = starts.map(item => item.value);
  return starts;
}

export async function getWakes():Promise<EventOopsie[]> {
  const db = await openDBlocal('oopsie', 1);
  const events = await db.getAll('events');

  db.close();
  var wakes: any[] = events.filter(event => event.value.type === eTypes.WAKE);
  wakes = wakes.map(item => item.value);
  return wakes;
}

export async function getStops():Promise<EventOopsie[]> {
  const db = await openDBlocal('oopsie', 1);
  const events = await db.getAll('events');
 
  db.close();
   // loop over events and filter leak events 
  var stops: any[] = events.filter(event => event.value.type === eTypes.MEASURINGDAY_STOPPED);
    // we get now something like this : {id: 3, value: {…}}  , so only get value, this contains the EventOopsie structure
  stops = stops.map(item => item.value);
  return stops;
}


 async function addEventLocal(event: EventOopsie) {
  const db = await openDBlocal('oopsie', 1);
  const lastUsedKey = await db.count('events');
  const newKey = lastUsedKey + 1;

  await db.put('events', { id: newKey, value: event });
  db.close();

}

// async function deleteEventLocal(event: EventOopsie) {
//   // open IDB database
//   const db = await openDBlocal('oopsie', 1);

//   // get all events
//   const allEvents = await db.getAll('events');

//   // search for event given by the function parameter

//   // delete this event if found
//   db.delete('events', { id: number, value: event }); 

//   // close DB
//   db.close();

// }

//delete the leakage date time when delete_icon is clicked
export async function deleteEventLocal(eventData: EventOopsie) {
  // Open the IDB database
  const db = await openDBlocal('oopsie', 1);

  try {
    // Get all events from the 'events' store
    const allEvents = await db.getAll('events');

    // Find the event with matching data
    const eventToDelete = allEvents.find((event) => {
      // check if the date/time is exactly the same.
      // no need to check for event type like leak/start/stop


      let customDate = getCustomDateRaw(event.value.date);
      
        if (event.value.type == "leak")
        {
          console.log("sameday")
          if (customDate.getTime() == eventData.date.getTime())
          {  
            console.log("the same" );
            console.log("");
          }
      
          return customDate.getTime() == eventData.date.getTime();
        }
    
    });

    if (eventToDelete) {
      // If the event is found, delete it
      await db.delete('events', eventToDelete.id);
      console.log('Event deleted:', eventToDelete);
    } else {
      console.log('Event not found.');
    }
  } catch (error) {
    console.error('Error deleting event:', error);
  } finally {
    // Close the database
    db.close();
  }
}


async function updateEvent(eventKey, newData) {
  const db = await openDBlocal('oopsie', 1);

  // Open a transaction on the 'events' store with "readwrite" mode
  const transaction = db.transaction('events', 'readwrite');
  const eventsStore = transaction.objectStore('events');

  try {
    // Retrieve the event you want to update
    const existingEvent = await eventsStore.get(eventKey);

    // Check if the event exists in the database
    if (existingEvent) {
      // Modify the event data (e.g., change some properties)
      // Assuming newData is an object containing the updated properties
      Object.assign(existingEvent.value, newData);

      // Use the `put` method to update the event in the database
      await eventsStore.put(existingEvent);

      console.log('Event updated successfully!');
    } else {
      console.error('Event not found in the database.');
    }
  } catch (error) {
    console.error('Error updating event:', error);
  } finally {
    // Close the transaction and the database connection
    transaction.commit();
    db.close();
  }
}

export async function createAndStoreLeak(dateAndTime: Date) {
  var event: EventOopsie = { type: eTypes.LEAK, value: 0, date: dateAndTime, extra_info: "" };
    await addEventLocal(event)
}

export async function createAndStoreStart(dateAndTime: Date) {
  var event: EventOopsie = { type: eTypes.MEASURINGDAY_STARTED, value: 0, date: dateAndTime, extra_info: "" };
    await addEventLocal(event)
}


export async function createAndStoreStop(dateAndTime: Date) {
  var event: EventOopsie = { type: eTypes.MEASURINGDAY_STOPPED, value: 0, date: dateAndTime, extra_info: "" };
    await addEventLocal(event)
}

/** Resolution-only log for predictive staircase dismiss (not when alarm starts). Synced like other events. */
export async function createAndStoreWake(opts: {
  dismissedAt: Date;
  stageReached: 1 | 2 | 3;
  predictedTime: Date;
}) {
  const extra_info = JSON.stringify({
    stage_reached: opts.stageReached,
    predicted_time: opts.predictedTime.getTime()
  });
  const event: EventOopsie = {
    type: eTypes.WAKE,
    value: opts.stageReached,
    date: opts.dismissedAt,
    extra_info
  };
  await addEventLocal(event);
}

// These ensure settings are saved to the LOCAL phone database immediately
txtSndfilename.subscribe(value => {
  storeSettingsVal("txtSndfilename", value);
  setSndFile(value);
});

store_onBoardingDone.subscribe(value => {
  storeSettingsVal("store_onBoardingDone", value);
});

store_selectedSound.subscribe(value => {
  storeSettingsVal("sound", value);
});


