

<!-- use the router to switch screens -->
<Router {routes} />

<script lang="ts">
// Import the router component
import Router from 'svelte-spa-router'
// Import the list of routes
import routes from './routes'
// src/i18n.js for internationalization
import { addMessages } from 'svelte-i18n';
import {  init, getLocaleFromNavigator, locale } from 'svelte-i18n';
import { StatusBar, Style} from '@capacitor/status-bar'


import en from './locales/en.json';
import nl from './locales/nl.json';
import ja from './locales/ja.json';
import de from './locales/de.json';
import es from './locales/es.json';
import zh_TW from './locales/zh_TW.json';
import zh_CN from './locales/zh_CN.json';
import tu from './locales/tu.json';
import fr from './locales/fr.json';




//import { openDB } from 'idb';
import { onMount } from 'svelte';
//import {store_customer_email, store_customer_email, store_customer_age } from './stores.js';
import { storeGetUserInfo, storeUserInfo, storeGetSettingInfo, initDBs} from './utils/dataStorage'
import {UserData} from './utils/dataStructures'


addMessages('nl', nl);
addMessages('en', en);
addMessages('ja', ja);
addMessages ('de', de);
addMessages ('es', es);
addMessages ('zh-TW', zh_TW);  // 'zh-TW' is the short form of Chinese (Traditional) language 
addMessages ('zh-CN', zh_CN);
addMessages ('tr', tu);  //'tr' is the short form Turkish language 
addMessages ('fr', fr);
init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
});

// Normalize regional Chinese browser locales to the catalogs shipped by the app.
const browserLocale = getLocaleFromNavigator();
if (browserLocale && /^zh(?:-|_)?/i.test(browserLocale)) {
  const normalizedLocale = /(?:TW|HK|MO)/i.test(browserLocale) ? 'zh-TW' : 'zh-CN';
  locale.set(normalizedLocale);
}


initDBs();


  storeGetUserInfo().then(a => {
    console.log("test",getLocaleFromNavigator())

  if (a != null) {
    console.log(a);
  }
  }).catch(error => {
  console.error(error);
  });
  


onMount( 
         () => {
          //setup_store_values()
         }
       );



</script>
