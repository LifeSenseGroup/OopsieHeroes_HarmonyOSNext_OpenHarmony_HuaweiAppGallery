import App from './App.svelte';
import './css/app.css'
import  Bridge from './utils/NativeBridge.js'
// import NativeBridge.js , this is injected by IOS webview WKUserContentController
// it runs javascripts code that can alter variables and DOM elements
// it also gives functions like setSound1() we can use in our app.

var app = new App({
	target: document.body
});


export default app;