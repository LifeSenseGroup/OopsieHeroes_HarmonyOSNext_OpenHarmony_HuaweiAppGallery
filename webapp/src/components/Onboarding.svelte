<script lang="ts">
  import { _ } from "svelte-i18n";
  import { locale, locales } from "svelte-i18n";
  import { onMount } from "svelte";
  import { pop, push } from "svelte-spa-router";

  import {storeSettingsVal, storeVallocal, storeUserVal,writeUserToRemoteDB} from "../utils/dataStorage";
  import {store_onBoardingDone,store_customer_email, store_customer_age, store_customer_sex, store_UserSavedToRemoteDB} from "../stores";
  import { validateEmail } from "../utils/utils";
  import PrivacyPolicy from '../routes/PrivacyPolicyScreen.svelte'
  export let section: number = 1; // there are 3 sessions, first the eamil then the age and then boy/girl

  var contactIsValid = false;
  
  $: contactIsValid = validateContactIdentifier($store_customer_email);

  onMount(() => {
    section = 1; // reset section
    //If 'Privacy policy' is clicked, then push ('#/PrivacyPolicyScreen');
  });

  function next() {
    // TODO
    //storeSettingsVal("txtSndfilename",1)
    if (section == 1) {
      storeUserVal("age", 1); // if the value is not changed by the user it will not be written, so force write to DB here
      // Email addresses must be valid emails. Phone numbers may use any
      // formatting and length, as long as they contain a digit.
      if (!checkContactIdentifier()) {
        // Display an error message and do not proceed to the next section 2
        return;
      }
    }

    if (section == 3) {
      $store_onBoardingDone = 1;
     // if (writeUserToRemoteDB())
     // {
     //   $store_UserSavedToRemoteDB = 1;
     // }
    }
    section = section + 1;
  }

  function validateContactIdentifier(value: string) {
    const identifier = value.trim();

    if (!identifier) return false;

    // An @ sign means the user is entering an email address, so it must pass
    // the email validation. Phone numbers are intentionally flexible.
    return identifier.includes("@") ? validateEmail(identifier) : /\d/.test(identifier);
  }

  function checkContactIdentifier() {
    contactIsValid = validateContactIdentifier($store_customer_email);
    return contactIsValid;
  }

  $: $store_customer_email, checkContactIdentifier();

  function storeSexMale() {
    $store_customer_sex = "male";
  }
  function storeSexFemale() {
    $store_customer_sex = "female";
  }

  function navigateToPrivacyPolicy() {
    push('#/PrivacyPolicyScreen');
}


  

</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninterafontSizective-element-interactions -->
<div class="dialog-container roundedBorders fontfamily" >
  <!-- svelte-ignore a11y-no-static-element-interactions      style="width: 80%; height: 70%;"-->
  <div class="dialog-content " on:click|stopPropagation>
    {#if section == 1}
    <!--    <div   id="popup" style=" font-family: Arial; width: 90vw; font-size: clamp(1rem, 3vw, 2rem);">
         <p style = "margin-right: 5px; font-family: Arial; font-weight: 555; font-size: 16px; color: black;">  -->
        <div   id="popup" style=" font-family: Arial; width: 88vw; font-size: clamp(1rem, 3vw, 2rem);">
        <h1 style="font-family: Arial; font-size: 32px;">{$_("OnboardingScreen.Hi!")}</h1>

        <p style = " font-family: Arial; font-size: 16px;">
          {$_(
            "OnboardingScreen.To start using Oopsie Heroes, we first need your email address."
          )}
        </p>
       
        <label style= "color: grey;" for="emailInput">{$_("OnboardingScreen.Email or phone number")}:</label>
        <input
           class={contactIsValid ? "fontSize" : "grey fontSize"}
          type="text"
          id="emailInput"
          inputmode="text"
          bind:value={$store_customer_email}
          style="border: none; border-bottom: 1px solid #ccc; padding: 5px; outline: none; width: 100%; height: 100%;" />

          <div style="display: flex; align-items: center;">
            <p style="margin-right: 5px; font-family: Arial; font-size: 13.8px;">
              {$_("OnboardingScreen.I agree to the")}:
            </p>
            <span style="font-family: Arial; color: blue;">
              <a href="#/PrivacyPolicyScreen" on:click={navigateToPrivacyPolicy} style="color: blue; text-decoration: none;">
                {$_("OnboardingScreen.Privacy Policy")}
              </a>
              </span>

          </div>
      </div>
    {/if}

    {#if section == 2}
      <div  
      style="font-family: Arial; width: 80vw; display: flex; flex-direction: column;  justify-content: center;white-space: nowrap; "
        id="popup"
        class="fontSize"
      >
        <h2 style=" font-family: Arial; font-size: 23px;">
          {$_('OnboardingScreen.How old are you?')}
        </h2>


        <input
          type="number"
          id="ageInput"
          bind:value={$store_customer_age}
          class="fontSize"
          style="border: none; border-bottom: 1px solid #ccc; padding: 5px; outline: none; width: 40%;"
        />
        <p id="ageError" style="color: red; display: none;">
          Please enter your age
        </p>
        <br /> <br />
      </div>
    {/if}

    {#if section == 3}
      <div
        style="font-family: Arial; width: 90vw; display: flex; flex-direction: column; align-items: center; justify-content: center; "
      >
        <h1> {$_('OnboardingScreen.Pick your hero!')}</h1>
        

        <div style="display: flex; flex-direction: row; align-items: center;">
          <button on:click={storeSexMale} style="border: none; outline: none;">
            <img
              src="build/images/boy.png"
              alt="boy"
              class="hero-image {$store_customer_sex === 'male'
                ? ''
                : 'transparent'}"
              style="width: 100%; height: 100%; max-height: 60vh;"
            />
          </button>
          <button
            on:click={storeSexFemale}
            style="border: none; outline: none;"
          >
            <img
              src="build/images/girl.png"
              alt="girl"
              class="hero-image {$store_customer_sex === 'female'
                ? ''
                : 'transparent'}"
              style="width: 100%; height: 100%; max-height: 60vh;"
            />
          </button>
        </div>
      </div>
    {/if}

    <div class="container">
      <div class="Next_Button">

        {#if section == 1}
        <button
        style="font-family: Arial; background-color: {contactIsValid ? '#007BFF' : '#9e9e9e'}; color: white; bottom: 10px; padding: 10px 20px 10px 20px;   border-radius: 4vw; border: none; margin-top:10px; font-size: clamp(1rem, 4vw, 4rem);"
        on:click={next}
      >
        {$_('OnboardingScreen.Let’s go!')}
        </button>
        {/if}

        {#if section == 2}
        <button
        style="font-family: Arial; background-color: {contactIsValid ? '#007BFF' : '#9e9e9e'}; color: white; bottom: 10%; width: 80px; height: 41px; border-radius: 12px; border: none; margin-top:20px;"
        on:click={next}
      >
        {$_('OnboardingScreen.Next')}
        </button>

        {/if}

     

        {#if section == 3}
        <button
        style=" font-family: Arial; background-color: {contactIsValid ? '#007BFF' : '#9e9e9e'}; color: white; bottom: 10px; padding: 10px 20px 10px 20px;   border-radius: 4vw; border: none; margin-top:10px; font-size: clamp(1rem, 4vw, 4rem);"
        on:click={next}
      >
        {$_('OnboardingScreen.Start')}
        </button>
        {/if}
        
      </div>
    </div>
  </div>
</div>



<style>

.fontfamily{
  font-family: Arial;
  /* font-family: 'Rubik-Medium';
  font-family: 'Rubik-Light'; */
}

.fontSize{ font-size: 26px;
}
 
.grey {
    color: grey;
  }

  .dialog-content {
    overflow: hidden !important; 
  }

  /* Add a media query to handle screens wider than 857px */
  @media (min-width: 858px) {
    .dialog-content {
      overflow: visible !important; /* Show content without hiding overflow */
    }
  }

  /* https://grid.layoutit.com/   */
  .container {
    display: grid;
    grid-template-columns: 1.0fr 1fr;
    grid-template-rows: 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas: ". Next_Button";
  }

  .Next_Button {
    grid-area: Next_Button;
    justify-content: end;
    display: flex;   justify-content: flex-end; text-align: right;
    
  }

  .transparent {
    opacity: 0.5; /* Adjust the opacity value as needed (0.0 = fully transparent, 1.0 = fully opaque)    transform: translateX(50%);*/
  }

 

  button {
    display: block;
  }
</style>
