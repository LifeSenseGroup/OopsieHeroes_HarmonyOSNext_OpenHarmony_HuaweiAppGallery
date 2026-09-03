# Oopsie Heroes for HarmonyOS Next

The HarmonyOS project contains the Oopsie webapp in `webapp/`. Its production
bundle is integrated at `entry/src/main/resources/rawfile/oopsie/` and is
loaded by the native `ActivityOopsieWeb` page.

## Update the integrated webapp

From the project root, install the webapp dependencies and build it:

```text
cd webapp
npm install
npm run build
```

Copy the generated `webapp/dist/index.html` and `webapp/dist/build/` into
`entry/src/main/resources/rawfile/oopsie/`, then build and run the HarmonyOS
application in DevEco Studio.


