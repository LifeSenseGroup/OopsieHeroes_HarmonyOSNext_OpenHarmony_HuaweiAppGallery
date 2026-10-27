//document.body.style.backgroundColor = 'red';
import {store_alarm, txtSndfilename, txtVibrate, store_nativeSystemType } from '../stores.js'
import { get } from 'svelte/store'
import { _ } from 'svelte-i18n'
import { shouldSuppressMoistureAlarm } from './moistureAlarmSuppress'

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
    const file = txtSndFile || txtSndfilenameValue;
    if (TEST) console.log("setSndFile"+file)
    if (store_nativeSystemTypeValue=="ios")  window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"SETSNDFILE"+file});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SETSNDFILE",
            value: file
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
}

/** Close the host app when the user declines the required privacy policy. */
export function exitApp()
{
    if (store_nativeSystemTypeValue === "harmonyos" && window.OopsieHarmony?.exitApp) {
        window.OopsieHarmony.exitApp();
        return;
    }

    window.close();
}

function playHarmonySound(fileName, durationMs = 3000, loop = true)
{
    if (store_nativeSystemTypeValue === "harmonyos" && window.OopsieHarmony?.playSound) {
        window.OopsieHarmony.playSound(fileName, Number.isFinite(durationMs) ? durationMs : 0, loop === true);
    }
}

function stopHarmonySound()
{
    if (store_nativeSystemTypeValue === "harmonyos" && window.OopsieHarmony?.stopSound) {
        window.OopsieHarmony.stopSound();
    }
}

//export function setVibrate(txtVibarteVol)
export function setVibrate(txtVibrate)
{
    if (TEST) console.log("setVibrate"+txtVibrateVol)
    if (store_nativeSystemTypeValue=="ios")  window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"SETVIBRATE"+txtVibrateVol});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SETVIBRATE",
            value: txtVibrateVol
          };

      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
}



export function setSound1()
{
    if (TEST) console.log("setsound1")
    if (store_nativeSystemTypeValue=="ios")  window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"SND1"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SND1",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    playHarmonySound("alarmsound1.mp3");
    txtSndfilename.set("alarmsound1.mp3")
}

export function setSound2()
{
    if (TEST) console.log("setsound2")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"SND2"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SND2",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    playHarmonySound("alarmsound2.mp3");
    txtSndfilename.set("alarmsound2.mp3")
   
}

export function setSound3()
{
    if (TEST) console.log("setsound3")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"SND3"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SND3",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    playHarmonySound("alarmsound3.mp3");
    txtSndfilename.set("alarmsound3.mp3")
    
}

export function setSound4()
{
    if (TEST) console.log("setsound4")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"SND4"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SND4",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    playHarmonySound("alarmsound4.mp3");
    txtSndfilename.set("alarmsound4.mp3")
   
}

export function setSound5()
{
    if (TEST) console.log("setsound5")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"SND5"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SND5",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    playHarmonySound("alarmsound5.mp3");
    txtSndfilename.set("alarmsound5.mp3")
   
}

export function setSoundCustom()
{
    if (TEST) console.log("setSoundCustom")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"SNDCUSTOM"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SNDCUSTOM",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    txtSndfilename.set("customSnd")
   
}

export function stopSound()
{
    if (TEST) console.log("stopsound")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"SNDSTOP"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "SNDSTOP",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    stopHarmonySound();
    
}

/**
 * Play the user-selected alarm (txtSndfilename) with runtime volume control.
 * No new audio assets — native layer reuses the already configured sound file.
 */
export function playSelectedAlarm(options = {})
{
    const volume = typeof options.volume === "number" ? options.volume : 1;
    const durationMs = options.durationMs ?? null;
    const loop = options.loop === true;
    const soundFile = options.soundFile || txtSndfilenameValue;
    const staircaseQuiet = options.staircaseQuiet === true;
    const skipSetSndFile = options.skipSetSndFile === true;

    if (soundFile && !skipSetSndFile) {
        setSndFile(soundFile);
    }

    const payload = { volume, durationMs, loop, staircaseQuiet };

    if (TEST) console.log("playSelectedAlarm", payload, soundFile);

    if (store_nativeSystemTypeValue=="ios") {
        window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"PLAYALARM", value: payload});
    }
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "PLAYALARM",
            value: payload
          };
      window.Android?.setActivities(JSON.stringify(msg))
    }
    if (store_nativeSystemTypeValue === "harmonyos") {
        playHarmonySound(soundFile, durationMs, loop);
    }
}

export function stopSelectedAlarm()
{
    stopSound();
}

export function recordSound()
{
    if (TEST) console.log("recordSound")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"RECORDSND"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "RECORDSND",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    if (store_nativeSystemTypeValue === "harmonyos") {
        window.OopsieHarmony?.startRecording();
    }
    
}

export function stopRecordSound()
{
    if (TEST) console.log("stopRecordSound")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"STOPRECORDSND"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "STOPRECORDSND",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    if (store_nativeSystemTypeValue === "harmonyos") {
        window.OopsieHarmony?.stopRecording();
    }
}

export function recordHeroNudgeSound(fileName = "hero_nudge_voice.wav")
{
    if (TEST) console.log("recordHeroNudgeSound")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"RECORDHERO", value:fileName});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "RECORDHERO",
            value: fileName
          };
      window.Android?.setActivities(JSON.stringify(msg))
    }
}

export function stopRecordHeroNudgeSound()
{
    if (TEST) console.log("stopRecordHeroNudgeSound")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"STOPRECORDHERO"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "STOPRECORDHERO",
            value: 1
          };
      window.Android?.setActivities(JSON.stringify(msg))
    }
}

export function playHeroNudgeSound(volume = 0.33)
{
    if (TEST) console.log("playHeroNudgeSound")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"PLAYHERO", value: volume});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "PLAYHERO",
            value: volume
          };
      window.Android?.setActivities(JSON.stringify(msg))
    }
}

export function stopHeroNudgeSound()
{
    if (TEST) console.log("stopHeroNudgeSound")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"STOPHERO"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "STOPHERO",
            value: 1
          };
      window.Android?.setActivities(JSON.stringify(msg))
    }
}

export function stopSoundDetection()
{
    if (TEST) console.log("stopSoundDetection")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"STOP"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "STOP",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    if (store_nativeSystemTypeValue === "harmonyos") {
        window.OopsieHarmony?.stopSoundDetection();
    }
}

export function startSoundDetection()
{
    if (TEST) console.log("startSoundDetection")
    if (store_nativeSystemTypeValue=="ios") window.webkit?.messageHandlers?.test?.postMessage({name:"test", cmd:"START"});
    if (store_nativeSystemTypeValue == "android")
    {
        var msg = {
            type: "action",
            text: "START",
            value: 1
          };
      // Send the msg object as a JSON-formatted string.
      window.Android?.setActivities(JSON.stringify(msg))
    }
    if (store_nativeSystemTypeValue === "harmonyos") {
        window.OopsieHarmony?.startSoundDetection();
    }
}

function beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
    snd.play();
}
//AlarmTriggered();
function AlarmTriggered()
{
    if (shouldSuppressMoistureAlarm()) {
        if (TEST) console.log('AlarmTriggered ignored (predictive staircase playback window)');
        return;
    }
    //beep(); -> this only works if user was interacting with screen
    // The in-app alarm screen is the visible alert; avoid a blocking WebView dialog.
    store_alarm.set(1);  
}
window.AlarmTriggered = AlarmTriggered;


