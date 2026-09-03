

<!-- use the router to switch screens -->
<Router {routes} />

<script lang="ts">
// Import the router component
import Router from 'svelte-spa-router'
// Import the list of routes
import routes from './routes'
// src/i18n.js for internationalization
import { addMessages } from 'svelte-i18n';
import {  init, getLocaleFromNavigator } from 'svelte-i18n';
import { StatusBar, Style} from '@capacitor/status-bar'


import en from './locales/en.json';
import nl from './locales/nl.json';
import ja from './locales/ja.json';
import de from './locales/de.json';
import es from './locales/es.json';
import zh_CN from './locales/zh_CN.json';
import tu from './locales/tu.json';
import fr from './locales/fr.json';




//import { openDB } from 'idb';
import { onMount } from 'svelte';
//import {store_customer_email, store_customer_email, store_customer_age } from './stores.js';
addMessages('nl', nl);
addMessages('en', en);
addMessages('ja', ja);
addMessages ('de', de);
addMessages ('es', es);
addMessages ('zh-CN', zh_CN);
addMessages ('tr', tu);  //'tr' is the short form Turkish language 
addMessages ('fr', fr);

const navigatorLocale = getLocaleFromNavigator();
const normalizedNavigatorLocale = navigatorLocale.replace(/_/g, '-');
const isChineseLocale = /^zh(?:-|$)/i.test(normalizedNavigatorLocale);
const isTraditionalChineseLocale = /^zh-(?:hant|tw|hk|mo)(?:-|$)/i.test(normalizedNavigatorLocale);
const initialLocale = isChineseLocale
  ? isTraditionalChineseLocale ? 'en' : 'zh-CN'
  : normalizedNavigatorLocale;
init({
  fallbackLocale: 'en',
  initialLocale,
});


onMount( 
         () => {
          //setup_store_values()
         }
       );



</script>
