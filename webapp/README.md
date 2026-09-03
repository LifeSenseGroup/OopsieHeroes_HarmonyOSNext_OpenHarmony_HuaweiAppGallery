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

