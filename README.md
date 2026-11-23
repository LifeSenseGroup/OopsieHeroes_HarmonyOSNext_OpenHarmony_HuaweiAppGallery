# Oopsie Heroes for HarmonyOS Next

The HarmonyOS project embeds the Oopsie web app from `webapp/` in the native
WebView page at `entry/src/main/ets/pages/activity_oopsie_web.ets`.

## Build and review

Open the root project in DevEco Studio to build and run the native app.
See [AppGallery review notes](docs/appgallery-review.md) for the privacy/store
changes, recording fix, device checks, and external sensor test procedure.

## Update the embedded web app

The committed bundle in `entry/src/main/resources/rawfile/oopsie/` is newer than
parts of `webapp/src`. Reconcile those differences before replacing the bundle.
The following commands build the source into `webapp/dist` only:

```text
cd webapp
npm ci
npm run build
```

The current Rollup configuration does not copy this output into the native
rawfiles. Do not overwrite the shipped assets with the older source build.
