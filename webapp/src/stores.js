/* stores are used for variables that need to live in many components e.g. shared between components */

import { writable } from 'svelte/store';


// android, ios, androidSimulator, iosSimulator, webapp, harmonyos
export const store_nativeSystemType = writable('harmonyos');
export const store_db = writable();

//export const store_customer_email = writable('Johnie Doe');
export const store_customer_email = writable('');

// export const store_customer_age = writable(1);
export const store_customer_age = writable();
export const store_customer_sex = writable("male");  // male,female
export const store_customer_country = writable('');

export const store_eventsInBackLogToBeSendToMongoDB = writable(0);

export const store_alarm = writable(0);

export const currentSelectedDate = writable(new Date());
export const txtSndfilename = writable("alarmsound1.mp3"); // TODO change bridge to use full names 
export const txtVibrate = writable (600000); //600 seconds in milliseconds  (600 sec = 10 minutes)
export const store_min_minutes_valid_night = writable(15);
// export const store_min_minutes_valid_night = writable(0.1);
export const store_onBoardingDone = writable(0);
export const store_smallOrLargeImageTxt = writable("Phone");
export const store_selectedSound = writable (1);
export const store_EventNrSavedtoRemoteDB = writable(0);
export const store_UserSavedToRemoteDB = writable(0);
export const store_globalSyncLock = writable(false);

