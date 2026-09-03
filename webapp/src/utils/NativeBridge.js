//document.body.style.backgroundColor = 'red';
import {store_alarm, txtSndfilename, txtVibrate, store_nativeSystemType } from '../stores.js'
import {set} from 'svelte/store'

let store_alarmValue;
let store_nativeSystemTypeValue;
let txtSndfilenameValue;
let txtVibrateVol;
var timeOutVar;

const TEST = true;

txtSndfilename.subscribe(value => {
    txtSndfilenameValue = value;  // only set for now so maybe not needed
  
  })

  txtVibrate.subscribe(value => {
    txtVibrateVol = value;  // only set for now so maybe not needed
  
  })

store_alarm.subscribe(value => {
  store_alarmValue = value;  // only set for now so maybe not needed

})

store_nativeSystemType.subscribe(value => {
    store_nativeSystemTypeValue = value;  // only set for now so maybe not needed
  
  })

export function setSndFile(txtSndFile)
{
    if (TEST) console.log("setSndFile"+txtSndfilenameValue)
    if (store_nativeSystemTypeValue=="ios")  window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SETSNDFILE"+txtSndfilenameValue});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SETSNDFILE",
            value: txtSndfilenameValue
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
}

//export function setVibrate(txtVibarteVol)
export function setVibrate(txtVibrate)
{
    if (TEST) console.log("setVibrate"+txtVibrateVol)
    if (store_nativeSystemTypeValue=="ios")  window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SETVIBRATE"+txtVibrateVol});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SETVIBRATE",
            value: txtVibrateVol
          };

      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
}



export function setSound1()
{
    if (TEST) console.log("setsound1")
    if (store_nativeSystemTypeValue=="ios")  window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SND1"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SND1",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
    txtSndfilename.set("alarmsound1.mp3")
}

export function setSound2()
{
    if (TEST) console.log("setsound2")
    if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SND2"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SND2",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
    txtSndfilename.set("alarmsound2.mp3")
   
}

export function setSound3()
{
    if (TEST) console.log("setsound3")
    if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SND3"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SND3",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
    txtSndfilename.set("alarmsound3.mp3")
    
}

export function setSound4()
{
    if (TEST) console.log("setsound4")
    if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SND4"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SND4",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
    txtSndfilename.set("alarmsound4.mp3")
   
}

export function setSound5()
{
    if (TEST) console.log("setsound5")
    if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SND5"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SND5",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
    txtSndfilename.set("alarmsound5.mp3")
   
}

export function setSoundCustom()
{
    if (TEST) console.log("setSoundCustom")
    if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SNDCUSTOM"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SNDCUSTOM",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
    txtSndfilename.set("customSnd")
   
}

export function stopSound()
{
    if (TEST) console.log("stopsound")
    if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"SNDSTOP"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SNDSTOP",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
    
}

export function recordSound()
{
    if (TEST) console.log("recordSound")
    if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"RECORDSND"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "RECORDSND",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
    
}

export function stopRecordSound()
{
    if (TEST) console.log("stopRecordSound")
    if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"STOPRECORDSND"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "STOPRECORDSND",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
}

export function stopSoundDetection()
{
    if (TEST) console.log("stopSoundDetection")
    if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"STOP"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "STOP",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
}

export function startSoundDetection()
{
    if (TEST) console.log("startSoundDetection")
    if (store_nativeSystemTypeValue=="ios") window.webkit.messageHandlers.test.postMessage({name:"test", cmd:"START"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "START",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      Android.setActivities(JSON.stringify(msg))
    }
}

function beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
    snd.play();
}
//AlarmTriggered();
function AlarmTriggered()
{
    //beep(); -> this only works if user was interacting with screen
    window.alert("alarm")
    store_alarm.set(1);  
}
window.AlarmTriggered = AlarmTriggered;


