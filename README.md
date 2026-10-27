# Oopsie Heroes for HarmonyOS Next

The HarmonyOS project embeds the Oopsie web app from `webapp/` in the native
WebView page at `entry/src/main/ets/pages/activity_oopsie_web.ets`.

## Update the embedded web app

The `webapp/` source is synchronized from the standalone `OopsieWebApp_`
project. Install its dependencies and build from the project root:

```text
cd webapp
npm ci
npm run build
```

The build generates the web assets and copies them into
`entry/src/main/resources/rawfile/oopsie/`, where the HarmonyOS app loads them.
Open the root project in DevEco Studio to build and run the native app.
