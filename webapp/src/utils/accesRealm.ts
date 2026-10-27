// We no longer use Realm, but the class and functions are still named like that for historical reasons. The code
// is adapted to use the MongoDB Data API instead of the Realm SDK, which is more suitable for our use case and avoids
// the need for user authentication and session management. The Data API allows us to directly interact with our
// MongoDB Atlas database using HTTP requests, which simplifies our architecture and improves performance for our specific needs.
import { v4 as uuidv4 } from 'uuid';
import { EventOopsie, eTypes } from './dataStructures';
import { store_customer_country, store_customer_email, store_customer_age, store_customer_sex, store_nativeSystemType } from '../stores'
import { get } from 'svelte/store';
import { txtSndfilename } from '../stores';

//const app: Realm.App = new Realm.App({ id: "application-0-hfbjx" }); // test DB
// const app: Realm.App = new Realm.App({ id: "stitchoopsieheroes-fngyh" }); // oopsie heroes DB
// for testing the bridge locally
const BRIDGE_URL = "https://oopsieheroes-bridge.onrender.com";

// I have to move the TimeZone offset to the date time, in order to save the right local date to MongoDB
function getNoOffsetDateFrom(date: Date): Date {
    const newDate = new Date(date); // Created a copy so we don't mutate the original date object
    const offsetHours = Math.round((newDate.getTimezoneOffset() / 60) * 2) / 2
    const newDateTime = newDate.getTime() - (offsetHours * 60 * 60 * 1000)
    newDate.setTime(newDateTime)
    return newDate
}

function getUniqueUUIDandCreateIfNeeded(): string {
  let uuid = localStorage.getItem('uuid');
  if (uuid === null) {
    uuid = uuidv4();
    localStorage.setItem('uuid', uuid);
  }
  return uuid;
}

// Replaced the old login function with this new one that just checks if we have the API key, since we are using
// the Data API now instead of the Realm SDK login. The rest of the code is adapted to use the Data API instead
// of the Realm SDK for database operations.
// const DATA_API_CONFIG = {
//   endpoint: "https://data.mongodb-api.com/app/stitchoopsieheroes-fngyh/endpoint/data/v1/action/",
//   apiKey: "1666cbbf-d1ec-4218-ae21-7689e532e87c", //private API key generated for this project in MongoDB
//   dataSource: "mongodb-atlas",
//   database: "oopsieheroesdatabase"
// };

export async function RealmStoreUserIfNeeded() {
  const alreadySaved = localStorage.getItem('userSavedToMongDB');
    if (alreadySaved === "true") {
      console.log("BRIDGE: User already saved, skipping request.");
      return true;
    }

  try {
    const response = await fetch(`${BRIDGE_URL}/save-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                 'ngrok-skip-browser-warning': 'true'},
      body: JSON.stringify({
        owner_id: getUniqueUUIDandCreateIfNeeded(),
        sex: get(store_customer_sex),
        email: get(store_customer_email),
        age: get(store_customer_age),
        country: get(store_customer_country),
        os: get(store_nativeSystemType),
        date: new Date()
      })
    });

    if (response.ok) {
      localStorage.setItem('userSavedToMongDB', "true");
      return true;
    }
  } catch (err) {
    console.error("Bridge connection failed:", err);
  }
  return false;
}


export async function RealmStoreEvents(events: EventOopsie[], startId: number) {
  const Userid = getUniqueUUIDandCreateIfNeeded();
  const currentAlarm = get(txtSndfilename);
  let lastSuccessfulIndex = -1;

  for (var i = 0; i < events.length; i++) {
    try {
      const body: Record<string, unknown> = {
        owner_id: Userid,
        date: getNoOffsetDateFrom(events[i].date),
        type: events[i].type,
        alarm_used: currentAlarm || "default_alarm.mp3"
      };

      if (events[i].type === eTypes.WAKE) {
        try {
          const x = JSON.parse(events[i].extra_info || "{}");
          if (typeof x.stage_reached === "number") body.stage_reached = x.stage_reached;
          if (typeof x.predicted_time === "number") {
            body.predicted_time = getNoOffsetDateFrom(new Date(x.predicted_time));
          }
        } catch {
          /* ignore malformed extra_info */
        }
      }

      const response = await fetch(`${BRIDGE_URL}/save-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        lastSuccessfulIndex = i;
      }
    } catch (err) {
      console.error("BRIDGE: Individual event save failed at index " + i, err);
      break;
    }
  }

  if (lastSuccessfulIndex !== -1) {
    const newPointer = startId + (lastSuccessfulIndex + 1);
    localStorage.setItem('eventsSavedToMongDB', newPointer.toString());
    console.log(`BRIDGE: Synced up to index ${newPointer}. Last type: ${events[lastSuccessfulIndex].type}`);
    return true;
  }
  return false;
}