<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { store_customer_country } from '../stores.js';

   /**
   * Trustpilot review popup logic:
   * 1. Region Locking: Only triggers for users in Australia (au), New Zealand (nz), Belgium (be), the Netherlands (nl), or Romania (ro, testing).
   * 2. Initial Delay: Only appears 8 days after the 'userRegistrationDate' (set during onboarding).
   * 3. Snooze Logic: If 'Maybe Later' is clicked, it stays hidden for another 8 days.
   * 4. Permanent Dismissal: Once 'Write a Review' is clicked, it never appears again.
   * 5. Reactivity: Uses Svelte's $: to ensure the popup shows as soon as the country store loads.
   */

  const EIGHT_DAYS_IN_MS = 8 * 24 * 60 * 60 * 1000;
  const hasReviewed = localStorage.getItem('hasReviewedTrustpilot') === 'true';
  $: showPopup = shouldShowPopup($store_customer_country);

  function shouldShowPopup(country) {
    if (hasReviewed) return false;
    const isTargetCountry =
      country === 'au' || country === 'nz' || country === 'be' || country === 'nl' || country === 'ro';
    if (!isTargetCountry) return false;

    const now = new Date().getTime();

    const registrationDate = localStorage.getItem('userRegistrationDate');
    if (!registrationDate) {
      localStorage.setItem('userRegistrationDate', now.toString());
      return false;
    }

    const timeSinceRegistration = now - parseInt(registrationDate);
    if (timeSinceRegistration < EIGHT_DAYS_IN_MS) {
      return false;
    }

    const snoozeTimestamp = localStorage.getItem('trustpilotSnoozeDate');
    if (snoozeTimestamp) {
      const timeSinceSnooze = now - parseInt(snoozeTimestamp);
      if (timeSinceSnooze < EIGHT_DAYS_IN_MS) {
        return false;
      }
    }

    return true;
  }

  function handleLater() {
    localStorage.setItem('trustpilotSnoozeDate', new Date().getTime().toString());
    showPopup = false;
  }

  function handleReview() {
    localStorage.setItem('hasReviewedTrustpilot', 'true');
    window.open('https://www.trustpilot.com/review/oopsieheroes.com', '_blank');
    showPopup = false;
  }
</script>



{#if showPopup}
<div class="popup-overlay">
  <div class="popup-content">
    <div class="tp-stars">★ ★ ★ ★ ★</div>
    <h3>{$_('trustpilot.title')}</h3>
    <p>{$_('trustpilot.body')}</p>

    <div class="button-stack">
      <button class="btn-review" on:click={handleReview}>
        {$_('trustpilot.review')}
      </button>
      <button class="btn-later" on:click={handleLater}>
        {$_('trustpilot.later')}
      </button>
    </div>

    <div class="tp-logo">{$_('trustpilot.verifiedBy')} <b>Trustpilot</b></div>
  </div>
</div>
{/if}

<style>
  .popup-overlay {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex; justify-content: center; align-items: center;
    z-index: 9999; /* Ensure it's on top of everything */
  }
  .popup-content {
    background: white;
    width: 85%;
    max-width: 350px;
    padding: 30px;
    border-radius: 25px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    font-family: Arial, sans-serif;
  }
  .tp-stars {
    color: #033145; /* Dark Blue */
    font-size: 32px;
    margin-bottom: 10px;
  }
  h3 { margin: 0; color: #333; font-size: 22px; font-weight: bold; }
  p { color: #555; font-size: 16px; line-height: 1.4; margin: 20px 0; font-style: italic; }

  .button-stack { display: flex; flex-direction: column; gap: 12px; }

  .btn-review {
    background: #033145;
    color: white; border: none;
    padding: 16px; border-radius: 12px; font-weight: bold;
    font-size: 16px; cursor: pointer;
  }
  .btn-later {
    background: transparent; color: #888; border: none;
    padding: 5px; font-size: 14px; cursor: pointer;
  }
  .tp-logo { margin-top: 20px; font-size: 12px; color: #bbb; letter-spacing: 0.5px; }
</style>