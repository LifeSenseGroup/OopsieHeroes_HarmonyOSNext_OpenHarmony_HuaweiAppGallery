// for storing data local and remote 

import { openDB as openDBlocal } from 'idb';

import { EventOopsie, UserData, eTypes } from './dataStructures';
import { store_selectedSound, store_onBoardingDone, store_customer_country, store_customer_email,  store_customer_age, store_customer_sex, store_eventsInBackLogToBeSendToMongoDB, txtSndfilename, txtVibrate} from '../stores'
import { get } from 'svelte/store';
import {setSndFile} from './NativeBridge'
import {setVibrate} from './NativeBridge'
import {getCustomDateRaw} from './utils'

//let store_eventsInBackLogToBeSendToMongoDBValue;
let store_customer_ageValue;
let store_customer_emailValue;
let store_customer_sexValue;
let store_customer_countryValue;
let store_eventsInBackLogToBeSendToMongoDBValue;
let txtSndfilenameValue;
let txtVibrateVol;
let store_selectedSoundValue;
let store_onBoardingDoneValue;



export let dataStorage_blockWriteToDB = true;
export function setDataStorageBlockWriteToDB(value: boolean) {
dataStorage_blockWriteToDB = value;
}

// to get things from stores.js 



// this is a .ts file not a .svelte module so we need to subscribe manualy
//subscribe means listen to changes, so a call back when someone else changes the store value
// there are also  update and set if we want to change the value
// with update you can change the value like this : count.update(n => n + 1);
// use set when you do not care about the old value: count.set(0);
// if this module was used in only 1 screen that gets destroyed sometimes use the unsubscribe() method in destroy() 
// or else there are memory leaks
// we also use storeUserVal to store the user data in the DB, when we read from the idb DB and asign to the store value,  this will also run the storeUserVal !?
store_customer_email.subscribe(value => {
      store_customer_emailValue = value;
      storeUserVal("email", value)
    });
  
  
store_customer_age.subscribe(value => {
      store_customer_ageValue = value;
      storeUserVal("age", value)
    });

store_customer_country.subscribe(value => {
      store_customer_countryValue = value;
      storeUserVal("country", value)
    });

store_customer_sex.subscribe(value => { 
      store_customer_sexValue = value;
      storeUserVal("sex", value)
    });

store_eventsInBackLogToBeSendToMongoDB.subscribe(value => {
      store_eventsInBackLogToBeSendToMongoDBValue = value;
    });

txtSndfilename.subscribe(value => {
      txtSndfilenameValue = value;
      storeSettingsVal("txtSndfilename",value)
      setSndFile(txtSndfilenameValue);
    });

store_onBoardingDone.subscribe(value => {
      store_onBoardingDoneValue = value;
      storeSettingsVal("store_onBoardingDone",value)
    });

store_selectedSound.subscribe(value => {
      store_selectedSoundValue = value;
      storeSettingsVal("sound",value)
    });


    
    


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
     console.log(txtSndfilenameValue);
     console.log(txtVibrateVol);
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
     console.log(store_customer_emailValue);

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


export async function getRemainingEvents(startIndex:number):Promise<EventOopsie[]> {

  const db = await openDBlocal('oopsie', 1);
  const events = await db.getAll('events');
  db.close();
  
  const valuesFromIndexXToEnd = events.slice(startIndex).map(item => item.value);  // only the remaining and strip the number only the value (event) itself

  return valuesFromIndexXToEnd;

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
  // Retrieve the last used key value from the database (assuming the store name is 'events')
  const lastUsedKey = await db.count('events');

  // Increment the retrieved value to get the new key for the next entry
  const newKey = lastUsedKey + 1;


  var counter:number = store_eventsInBackLogToBeSendToMongoDBValue;

  db.put('events', { id: newKey, value: event }); 
  counter++;
  store_eventsInBackLogToBeSendToMongoDB.set(counter);
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


// Assuming you have the required functions and variables (openDBlocal and store_eventsInBackLogToBeSendToMongoDBValue) already defined.

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

export async function writeUserToRemoteDB() {

  var retVal = false;
  const app = new Realm.App({ id: "application-0-hfbjx" });
  const credentials = Realm.Credentials.anonymous();
  try {
    const user = await app.logIn(credentials);
    console.log(user);
    const mongo = await app.currentUser.mongoClient("mongodb-atlas");
    const collection = mongo.db("oopsieheroesdatabase").collection("oopsieheroesusers");
    const result = await collection.updateOne({ owner_id: user.id }, { $set: { name : "test555", age:10, email_id: "test@test.nl"} }, { upsert: true });
    if  (result){retVal = true;}
  }catch(err) {console.log(err);}
}

