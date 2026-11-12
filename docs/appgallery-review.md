# AppGallery-review: Oopsie Heroes HarmonyOS Next

Release: **1.0.4** (`versionCode: 1000004`) op `HarmonyOSNext_Fix`.
Versie **1.0.3 is nog in review**; versie **1.0.4 is volgens de ontwikkelaar al
geüpload**, maar nog niet voor review ingediend. Wacht de review van 1.0.3 af en
gebruik bij een afwijzing de al geüploade 1.0.4 voor de volgende indiening.
De lokale signing en `build-profile.json5` zijn behouden en vallen buiten de
releasecommit. De code is niet op een echt HarmonyOS-toestel getest.

## 1. Privacytags in AppGallery Connect

Ga naar **Apps and atomic services > Oopsie Heroes > Version information > Privacy tags**.
De keuze **Collect personal data: No** past niet bij deze versie.
Gebruik de werkelijke gegevens en doeleinden; vul niet alleen de aangevraagde permissies in.

De meegeleverde productiebundle bevat onderstaande gegevensverwerking. De JavaScript
en de bijbehorende `sourcesContent` zijn onderzocht in
`entry/src/main/resources/rawfile/oopsie/build/bundle.js` en `bundle.js.map`.
Dit is codeonderzoek, geen bewijs dat alle netwerkverzoeken succesvol zijn uitgevoerd.

| Gegevens | Bewijs in productiebundle | Doel / invulrichting |
| --- | --- | --- |
| E-mailadres of telefoonnummer | Invoer bij onboarding; opgeslagen onder `email`; payload van `/save-user` | Basisfunctie/account- of gebruikersregistratie; verklaar waarom dit nodig is |
| Gegenereerde gebruikers-ID | `owner_id` koppelt gebruikers- en nachtgegevens | Gebruikersidentificatie voor de appfunctie |
| Gekozen held, opgeslagen als `sex` | Keuze bij onboarding, meegestuurd bij `/save-user` | Personalisatie; bevestig of dit werkelijk geslacht van een persoon is of alleen een avatarvoorkeur |
| Leeftijd | Leeftijdinvoer bij onboarding (`ageInput`), opgeslagen als `age` en opgenomen in `/save-user` | Gebruikersprofiel/appfunctionaliteit |
| Land en IP-adres | `/detect-country` bepaalt land via netwerk; land wordt opgeslagen | Approximate location/land; netwerkserver ontvangt een IP-adres. Geen bewijs van GPS-gebruik in de actieve WebView-route |
| Nacht- en ongevalgegevens | `/save-events`: gebruikers-ID, datum/tijd, start/stop/leak/wake, gebruikt alarm en voorspellingsvelden | Appfunctionaliteit/nachtregistratie; beoordeel onder de gezondheids-/persoonlijke gegevens van Huawei |
| Stemopname en microfoonaudio | Native `AVRecorder`; sensoranalyse via `AudioCapturer` | User information > Audio recording voor persoonlijke alarmstem; audio voor sensordetectie. Geen stemherkenning of voiceprint-authenticatie |
| OS/platform | `os` in gebruikerspayload | Appfunctionaliteit/compatibiliteit; verklaar eventueel apart analytisch gebruik als dat werkelijk gebeurt |

De native stemopname staat in de eigen appopslag (`recorded_audio.m4a`). In deze
opnamecode is geen audio-upload gevonden. Sensoraudio wordt als PCM geanalyseerd;
de detector bewaart die audio niet als opnamebestand. De app heeft wel een
backup-extension: controleer back-upgedrag voordat je zegt dat gegevens nooit
buiten het toestel komen.

De daadwerkelijke productiebundle bevat uploadpaden naar
`https://oopsieheroes-bridge.onrender.com` (`/save-user`, `/save-events`, `/detect-country`).
Een ouder MongoDB Data API-pad staat alleen in de sourcemap-broninhoud; het is niet
aanwezig in de minified productie-JavaScript en is geen bewijs van een actief uploadpad.
De backendcode en MongoDB-verbindingsconfiguratie staan niet in deze repository.
De regio van de MongoDB-database is daardoor niet vastgesteld.

[Render biedt momenteel regio's in de VS, Duitsland en Singapore](https://render.com/docs/regions),
geen regio op het Chinese vasteland. Bij gebruik van deze backendroute worden
gegevens dus al buiten het Chinese vasteland verwerkt, ook als de uiteindelijke
MongoDB-database daar wel staat. Bevestig bij de backendbeheerder de productieconfiguratie,
doeleinden, bewaartermijnen, hostingregio's en betrokken verwerkers voordat je
`Disclosure to third parties` en `Cross-border transfer` definitief invult.

Laat de privacyverklaring, toestemmingsschermen en tags hetzelfde gedrag beschrijven.
Gebruik `App functionality` en waar toepasselijk `Product personalization`;
vink analytics/marketing niet aan zonder daadwerkelijk gebruik te bevestigen.

Bron: [Huawei Privacy Tag Service Description](https://developer.huawei.com/consumer/en/doc/privacy-label).

## 2. Categorie en hoofdlabel

Volg de expliciete instructie van de reviewer: **Tools**, hoofdlabel **Alarm**.
Dit is een portalwijziging, geen broncodewijziging. Dien eventueel gevraagde
kwalificatiedocumenten via AppGallery in; uit de afwijzing volgt niet welke documenten
voor dit specifieke product nodig zijn.

## 3. Externe sensor uitleggen en testbaar maken

Huawei had volgens de ontwikkelaar geen Oopsie-sensor of geluidssignaal voor de test.
De native implementatie luistert naar het akoestische sensorsignaal via de microfoon;
de actieve detectieroute vereist geen Bluetooth-koppeling. De app zelf detecteert
geen vocht zonder de aparte sensor.

Verwijder de formulering **includes a ... sensor** uit de appomschrijving als de
appdownload zelf geen hardware bevat. Gebruik bijvoorbeeld, na controle van de
werkelijke productwerking:

> Oopsie Heroes is the companion app for the separate Oopsie Heroes moisture sensor.
> The sensor is required for accident detection and is not included in the app download.
> When monitoring is enabled, the app uses the phone microphone to recognize the
> compatible sensor's audible signal and plays the selected alarm.

Leg ook in de omschrijving uit hoe de sensor verkrijgbaar is. Lever een video van
de echte sensor + het HarmonyOS-toestel en bied testhardware aan als Huawei die vraagt.
Alleen een tekstwijziging bewijst niet dat de functie op hun toestel werkt.

Er is daarnaast een **synthetisch testsignaal**, `review-assets/sensor-test.wav`.
Dit bevat drie pulsen van 4096 Hz (ongeveer 4 kHz), steeds één seconde aan en één
seconde uit. De digitale PCM-data wordt bij generatie door de bestaande detector
gecontroleerd. Dit bewijst de detectielogica, niet de akoestische werking via een telefoon.

Genereren: `node scripts/generate-review-sensor-tone.cjs`.
Testprocedure voor de reviewer:

1. Open de app, voltooi onboarding en geef microfoontoestemming.
2. Kies op het hoofdscherm **Go to sleep** om sensormonitoring te activeren.
3. Speel de WAV op een **tweede apparaat/luidspreker** in de buurt af, op een
   bescheiden hoorbaar volume. Speel hem niet op hetzelfde testtoestel af.
4. Controleer dat de app het patroon detecteert en het geselecteerde alarm afspeelt.
5. Stop het alarm. Controleer de functie ook met de echte sensor vóór herindiening.

Te gebruiken tekst bij **App Review Information** (pas testuitkomsten toe):

> Accident detection requires a separate Oopsie Heroes sensor, which is not part of
> the app download. The app recognizes its acoustic signal using the microphone.
> We understand that the previous review did not include access to the sensor.
> For a software-path check, we provide a clearly marked synthetic sensor test WAV
> and the steps above; it does not replace testing with the actual accessory.
> Please let us know through the Interaction Center if physical test hardware is needed.

## 4. Stemopname: wijziging en hertest

De productiebundle toont drie seconden opnemen, terwijl de native recorder tien
seconden bleef lopen. Een MP4/M4A-opname is pas afspeelbaar na finaliseren door
`AVRecorder.stop()`. Afspelen kon die stap voorbijlopen, ook bij een lopende Stop.

Lokaal aangepast in `activity_oopsie_web.ets`:

- Native opnameduur gelijkgetrokken met de meegeleverde UI: drie seconden.
- Afspelen van de stem wacht op starten, stoppen en afsluiten van de opname.
- De microfoon wordt tijdens een stemopname niet gedeeld met sensormonitoring;
  gevraagde monitoring wordt daarna hervat, tenzij die intussen is uitgezet.
- Microfoontoestemming wordt gecontroleerd; fouten geven een Engelse/Chinese melding.
- Een bestaande opname wordt pas vervangen als de nieuwe opname is afgesloten.

Lokale hosttests: `node --test entry/src/test/VoiceRecording.node.test.cjs`.
De tests simuleren native APIs en bevestigen geen werkelijke microfoon- of speakerwerking.

Test via Huawei Cloud Debugging op een vergelijkbaar HarmonyOS 6.1/API 26-toestel,
liefst in het Chinees: opnemen, automatisch stoppen, terugluisteren, handmatig
stoppen en direct afspelen, opnieuw opnemen, weigeren van microfoontoestemming,
en opnemen terwijl monitoring actief was. Controleer vooraf of de cloudservice
microfooninvoer en audio-uitvoer ondersteunt; vraag anders Huawei om een gerichte hertest.
Een gewone schermvideo zonder audio bewijst dit niet.

Zeg pas in de reviewreactie dat de fout is opgelost nadat die toesteltest is geslaagd.

## 5. Camera-uitsparing

De WebView gebruikte `expandSafeArea` voor boven- en onderrand, waardoor ook tekst
onder de statusbalk/camera kon verschijnen. Deze uitbreiding is verwijderd en
modulemetadata `avoid_cutout=true` is toegevoegd. Controleer kalenderkop en
terugnavigatie op een toestel met uitsparing; controleer ook de onderste bediening.

Bron: [Huawei safe-area reference](https://developer.huawei.com/consumer/en/doc/harmonyos-references/ts-universal-attributes-expand-safe-area/).

## Voor herindienen

1. Bevestig de gegevensverwerking en werk de privacytags/verklaring bij.
2. Stel Tools / Alarm in en verduidelijk de hardwarevereiste.
3. Rond toesteltests en reviewbewijs af; de lokale build is geen toesteltest.
4. `AppScope/app.json5` staat al op `1.0.4` met `versionCode: 1000004`.
   Selecteer de al geüploade 1.0.4 voor de volgende review. Als daarna nog code
   verandert, gebruik dan een volgend beschikbaar versienummer en hogere versionCode.
5. Voor een nieuwe build: gebruik het bestaande releaseproduct `default` voor
   een ondertekende `.app`; signingbestanden blijven lokaal.

Let op: de ingebouwde webbundle is nieuwer dan delen van `webapp/src`. De huidige
Rollup-config bouwt naar `webapp/dist` en synchroniseert niet naar de native rawfiles.
De webbundle is voor deze fixes daarom behouden. Overschrijf hem niet vanuit de
oudere bron voordat die verschillen zijn uitgezocht.
