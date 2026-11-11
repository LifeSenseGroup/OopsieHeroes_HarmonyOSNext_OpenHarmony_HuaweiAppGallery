# OopsieWebView

web version of the Oopsie Heroes App should replace the current react-native which has too many dependancies to not core libraries.

- because of the scripting in rollup when adding images first do a npm run build, which copies the images to public/build/images/
  npm run dev does not do this copying

- time dependesies :
   after 4 days a review question is made
   after 15 min a valid night begins, lesser and the 'sleep' does not count 
   saving to the database goes direct in the old oopsie, new also but also checks if saved or not so when again online send everything...
   every leak after 18:00 is for the comming night, before every leak if for the past night.
   
- DB storag, only write is allowed to the DB, all settings (and more) are also stored locally
  for now (april-2023) free version of the database with no backup. So now and then the DB should be backuped manually.

   mongoDB, oopsie heroes 
     Users and Leaks collection

- localstorage :   web local storage for testing in the browser and first version.
                   Later on needs to use capacitor (native) local storage

- algos :
    - every 2 nights of usages increase level (in total 15 levels). At the end it will stay at level15
    - congratulations screen is show when dry nigth after going out of sleep. 
    - After going out of sleep all leaks/nights are updated in the DB and localstorage
    - percentage :  dryNightsPercentage = Math.floor((1- (leaksNr / measuredNrNights)) * 100);

- calendar : 
  show a star when the night was dry, this means because of the 6pm day/night boundary that when user starts for example at 11 april 18:05 and stop the sleep mode at 18:30  12april becomes a star. Until it starts again for that night and a leak will occur before 6pm 12 april. 
  show a cirlce for the current day. 
  show a circle with blue color fill when 

- predictive alarm (calendar heatmap / nightly outlook) :
   - after enough leak history (min 3 nights with leaks) the calendar can offer a prediction for the next likely toilet visit
   - the box shows roughly when the leak may happen as minutes after going to sleep, not as a fixed clock time 
   - alarm is off by default; user must press Activate alarm on the prediction box to opt in for that offer
   - after Go to sleep the target is recalculated from the real bedtime and a 3-step staircase is scheduled: whisper (10% vol, ~15s), nudge (25%, ~30s), wake (100%, loops until dismissed)
   - how the prediction is computed (PredictionEngine.ts) :
      - take up to the last 8 completed nights; for each night pair a Go to sleep with leaks in that window
      - use minutes from Go to sleep until the first leak of the night
      - need at least 3 consecutive completed nights that each had a leak; a dry night resets the count; if timing varies too much (std dev > 60 min) stay REACTIVE
      - slide a 60 min window over those first-leak times and pick the window where most nights cluster (last 3 nights count double)
      - if that cluster is strong enough (confidence >= 60%) we predict the next leak around the start of that window
      - the calendar box shows that as minutes after going to sleep; whisper/nudge/wake are 15 and 7 min before that time
      - after you Activate a prediction and that cycle completes, the counter resets and you need 3 new consecutive leak nights; declining or ignoring the box does not reset it, and new leaks keep updating the offer while the streak builds
   - a normal sensor leak during the night still wins over the prediction (reactive alarm path)
   - main code: PredictionEngine.ts, PredictiveStaircaseScheduler.ts, predictionLifecycle.ts, CalendarScreen.svelte, HomeScreen.svelte
   
- GUI:
   - backgrounds and some other pictures have 2 versions one for phones and one wider version for Tablets.
   - startup/splash screen is used
   - when in sleep mode a audio record (from the native taks) is shown and also a small oopsie heroes icon.

- audio detection:
   - for IOS native AV audio codes are used. Optiomized DSP routines are used for the FFT that detects the 1sec, 1 sec off 4 khz tone.

- important data structures :
   
some variables are also used/subscribed in dataStorage.ts so that if the value changes it will automatically be saved to the internal (or later external) DB.
example :  
txtSndfilename.subscribe(value => {
      txtSndfilenameValue = value;
      storeSettingsVal("txtSndfilename",value)
    })
txtSndfilename is a svelte store variable, whenever it changes in the application it will be stored in the settings section of the IndexDB of the webbrowser.
In this case  indexDB->Oopsie->settings (can be viewed in chrome->devTools->Application->Storage)

