// Components''

import Home from './routes/HomeScreen.svelte'
import Calendar from './routes/CalendarScreen.svelte'
import Settings from './routes/SettingsScreen.svelte'
import Onboarding from './routes/OnboardingScreen.svelte'
import Star from './routes/StarScreen.svelte'
import PrivacyPolicy from './routes/PrivacyPolicyScreen.svelte'



// Export the route definition object
export default {
    // Exact path
    '/': Home,
    '/CalendarScreen' : Calendar,
   '/SettingsScreen': Settings,
   '/OnboardingScreen' : Onboarding,
   '/StarScreen' : Star,
   '/PrivacyPolicyScreen' : PrivacyPolicy



}