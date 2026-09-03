import * as Realm from "realm-web";
import { v4 as uuidv4 } from 'uuid';
import { EventOopsie } from './dataStructures';
import { store_customer_country, store_customer_email, store_customer_age, store_customer_sex } from '../stores'

let store_customer_ageValue;
let store_customer_emailValue;
let store_customer_sexValue;
let store_customer_countryValue;

var user: Realm.User;

store_customer_email.subscribe(value => {
  store_customer_emailValue = value;
});


store_customer_age.subscribe(value => {
  store_customer_ageValue = value;
});

store_customer_country.subscribe(value => {
  store_customer_countryValue = value;
});

store_customer_sex.subscribe(value => {
  store_customer_sexValue = value;
});

//const app: Realm.App = new Realm.App({ id: "application-0-hfbjx" }); // test DB
const app: Realm.App = new Realm.App({ id: "stitchoopsieheroes-fngyh" }); // oopsie heroes DB



// I have to move the TimeZone offset to the date time, in order to save the right local date to MongoDB
function getNoOffsetDateFrom(date: Date): Date {
  const offsetHours = Math.round((date.getTimezoneOffset() / 60) * 2) / 2
  const newDateTime = date.getTime() - (offsetHours * 60 * 60 * 1000)
  date.setTime(newDateTime)
  return date
}

function getUniqueUUIDandCreateIfNeeded(): string {
  let uuid = localStorage.getItem('uuid');
  if (uuid === null) {
    uuid = uuidv4();
    localStorage.setItem('uuid', uuid);
  }
  return uuid;
}


async function login() {

  // Create an anonymous credential
  const credentials = Realm.Credentials.anonymous();

  try {
    // Authenticate the user
    user = await app.logIn(credentials);
    const mongo = await app.currentUser.mongoClient("mongodb-atlas");  // ignoring the warning that it is not an async function
    return mongo;

  } catch (err) {
    console.error("Failed to log in", err);
    return null;
  }

}


export async function RealmStoreUserIfNeeded() {

  var retVal = false;

  let userSaved = localStorage.getItem('userSavedToMongDB');
  if (userSaved === null) 
  {
    try {
      var mongo = await login();
      console.log("LOGIN FOR USER")
    } catch (err) {
      console.error("Failed to log in", err);
      return null;
    }

    if (mongo) {

      var Uniqueid =  getUniqueUUIDandCreateIfNeeded();
      console.log("unique id", Uniqueid);
      try {
        const collection = mongo.db("oopsieheroesdatabase").collection("oopsieheroesusers");
        const result = await collection.insertOne({ owner_id: Uniqueid,sex: store_customer_sexValue, country : store_customer_countryValue, age:store_customer_ageValue, email: store_customer_emailValue, date: new Date() });
        if (result) {
          retVal = true;
          console.log("USER SHOULD BE SAFED",Uniqueid)
          localStorage.setItem('userSavedToMongDB', "true");
        }
      } catch (err) {
        console.error("Failed to log in", err);
        return null;
      }
    }

  
    try {
      app.currentUser.logOut();
      console.log("LOGOUT FOR USERS")
    } catch (err) {
    console.error("Failed to log out", err);
    }
  }
  return retVal;
}

export async function RealmStoreEvents(events: EventOopsie[], startId: number) {

  var retVal = false;

  try {
    var mongo = await login();
    console.log("LOGIN FOR EVENTS")
  } catch (err) {
    console.error("Failed to log in", err);
    return null;
  }

  if (mongo) {

    var Userid = getUniqueUUIDandCreateIfNeeded();
    console.log("Userid: ", Userid);
    try {
      const collection = mongo.db("oopsieheroesdatabase").collection("oopsieheroesleaks");
      var result;

      for (var i = 0; i < events.length; i++) {

        result = await collection.insertOne({
          owner_id: Userid,
          date: getNoOffsetDateFrom(events[i].date),  // I have to move the TimeZone offset to the date time, in order to save the right local date to MongoDB (TODO: check)
          type: events[i].type
        })
      }
      if (result) {
        retVal = true;
        localStorage.setItem('eventsSavedToMongDB', (events.length + startId).toString());
      }


    } catch (err) {
      console.error("Failed to log in", err);
      return null;
    }

    try {
      app.currentUser.logOut();
      console.log("LOGOUT FOR EVENTS")
    } catch (err) {
      console.error("Failed to log out", err);
    }
  }
  return retVal;
}




