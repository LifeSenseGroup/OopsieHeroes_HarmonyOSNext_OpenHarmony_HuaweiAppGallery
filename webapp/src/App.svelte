

<!-- use the router to switch screens -->
<Router {routes} />

<script lang="ts">
// Import the router component
import Router from 'svelte-spa-router'
// Import the list of routes
import routes from './routes'
// src/i18n.js for internationalization
import { addMessages, init, getLocaleFromNavigator, locale, _ } from 'svelte-i18n';
import { StatusBar, Style} from '@capacitor/status-bar'


import en from './locales/en.json';
import nl from './locales/nl.json';
import ja from './locales/ja.json';
import de from './locales/de.json';
import es from './locales/es.json';
import zh_CN from './locales/zh_CN.json';
import tu from './locales/tu.json';
import fr from './locales/fr.json';
import { isChineseLocale, phoneLanguageTag } from './utils/locale';




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
// Simplified and Traditional Chinese phone settings both use Simplified Chinese.
const chineseLocaleTags = [
  'zh',
  'zh-CN',
  'zh-Hans',
  'zh-Hans-CN',
  'zh-SG',
  'zh-Hans-SG',
  'zh-TW',
  'zh-HK',
  'zh-MO',
  'zh-Hant',
  'zh-Hant-TW',
  'zh-Hant-HK',
  'zh-Hant-MO'
];
for (const tag of chineseLocaleTags) {
  addMessages(tag, zh_CN);
}
addMessages ('tr', tu);  //'tr' is the short form Turkish language 
addMessages ('fr', fr);
init({
  fallbackLocale: 'en',
  initialLocale: phoneLanguageTag(getLocaleFromNavigator()),
});

$: if (typeof document !== 'undefined') {
  document.title = $_('appTitle');
  if ($locale) {
    document.documentElement.lang = isChineseLocale($locale) ? 'zh-CN' : $locale;
  }
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
