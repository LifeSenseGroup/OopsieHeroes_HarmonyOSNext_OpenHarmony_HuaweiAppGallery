# Prediction manual test plan

Times are **minutes after that night's Go to sleep**. The prediction box shows the predicted leak in that form. The first ring starts 15 minutes earlier than the number in the box.

Before each scenario, clear the stored nights and any prediction that is already active. Open Calendar in the afternoon after the last night, before the usual bedtime, unless a row says otherwise. Wake up is 660 minutes after a 20:00 bedtime (07:00 the next morning). When a bedtime is different, the wake column says how many minutes after that sleep.

The box writes the minutes like this: 15 → `15 min`, 60 → `1 hour`, 100 → `1h 40m`, 120 → `2 hours`, 150 → `2h 30m`, 180 → `3 hours`, 250 → `4h 10m`, 280 → `4h 40m`, 393 → `6h 33m`, 410 → `6h 50m`.

## Overview

| # | What you are checking | Box shows |
| --- | --- | --- |
| 1 | Three identical wet nights | Case 1, 150 min after sleep |
| 2 | Leaks inside one hour, earliest leak wins | Case 1, 15 min after sleep |
| 3 | A new run replaces the old leak time | Case 1, 60 min after sleep |
| 4 | Tonight's leak time has already passed | Case 1, 150 min after the next sleep |
| 5 | Only two wet nights | No prediction |
| 6 | Dry night after only three wet nights | No prediction |
| 7 | The leak time jumps after a dry night | No prediction |
| 8 | Three leaks hours apart | No prediction |
| 9 | Six matching wet nights, then a dry night | Case 2, 180 min after sleep |
| 10 | An early bedtime follows a later leak | Case 3, 393 min after sleep |
| 11 | The leak drifts 15 minutes later each night | Case 4, 410 min after sleep |
| 12 | Early bedtimes and late bedtimes leak at different times | Case 5, 120 min after sleep |
| 13 | Tonight's bedtime is much later than usual | Case 6, 180 min after sleep |
| 14 | Weeknight after a weekend pattern | Case 7, 100 min after sleep |
| 15 | Friday night uses the weekend time | Case 7, 280 min after sleep |
| 16 | The leak time steps to a new level | Case 8, 250 min after sleep |

## 1. Three identical wet nights

Each leak is 150 minutes after sleep. Case 1 takes this.

Box: **150 min** after sleep (`2h 30m`). First ring at 135 min.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 150 |
| 2 | 150 |
| 3 | 150 |

## 2. Leaks inside one hour, earliest leak wins

The leaks are 15, 30, and 60 minutes after sleep. They fit in one 60-minute window, so the box uses the earliest.

Box: **15 min** after sleep. The first ring is at Go to sleep.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 15 |
| 2 | 30 |
| 3 | 60 |

## 3. A new run replaces the old leak time

The dry night ends the 150-minute run. The next three nights leak at 60 minutes, so 150 is not used.

Box: **60 min** after sleep (`1 hour`). First ring at 45 min.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 150 |
| 2 | 150 |
| 3 | 150 |
| 4 | Dry night |
| 5 | 60 |
| 6 | 60 |
| 7 | 60 |

## 4. Tonight's leak time has already passed

Same three nights as scenario 1. Open Calendar after 150 minutes past the usual bedtime. The offer moves to the following evening. The box still says 150 minutes after that next sleep.

Box: **150 min** after sleep (`2h 30m`). First ring at 135 min.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 150 |
| 2 | 150 |
| 3 | 150 |

## 5. Only two wet nights

Every case needs more nights than this.

Box: no prediction.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 150 |
| 2 | 150 |

## 6. Dry night after only three wet nights

The dry night breaks the three-night run. Four nights are not enough for Case 2.

Box: no prediction.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 150 |
| 2 | 150 |
| 3 | 150 |
| 4 | Dry night |

## 7. The leak time jumps after a dry night

The new leak is 90 minutes earlier than the old ones, and there is only one night at the new time.

Box: no prediction.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 150 |
| 2 | 150 |
| 3 | 150 |
| 4 | Dry night |
| 5 | 60 |

## 8. Three leaks hours apart

The spread is wider than 60 minutes, and there are not enough nights for a later case.

Box: no prediction.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 60 |
| 2 | 180 |
| 3 | 300 |

## 9. Six matching wet nights, then a dry night

Last night was dry, so the three-night rule stays quiet. The six leaks before that were all 180 minutes after sleep.

Box: **180 min** after sleep (`3 hours`). First ring at 165 min.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 180 |
| 2 | 180 |
| 3 | 180 |
| 4 | 180 |
| 5 | 180 |
| 6 | 180 |
| 7 | Dry night |

## 10. An early bedtime follows a later leak

Bedtime moves, and the leak stays about 400 minutes after a 19:00 bedtime by shrinking as bedtime gets later. On the check night the child is already asleep at the early bedtime. Open Calendar 10 minutes after that Go to sleep.

A bedtime of +0 is 19:00. +60 is one hour later, and so on. Wake is 07:00 the next morning, so the minutes after sleep depend on that bedtime.

Box: **393 min** after sleep (`6h 33m`). First ring at 378 min.

| Night | Bedtime, minutes after 19:00 | Leak, minutes after sleep | Wake, minutes after sleep |
| --- | --- | --- | --- |
| 1 | 0 | 400 | 720 |
| 2 | 240 | 160 | 480 |
| 3 | 60 | 340 | 660 |
| 4 | 180 | 220 | 540 |
| 5 | 120 | 280 | 600 |
| 6 | 0 | 400 | 720 |
| 7 | 240 | 160 | 480 |
| 8 | 60 | 340 | 660 |
| 9 | 180 | 220 | 540 |
| 10 | 120 | 280 | 600 |
| 11 | 0 | 400 | 720 |
| 12 | 240 | 160 | 480 |
| 13 | 60 | 340 | 660 |
| 14 | 180 | 220 | 540 |
| 15 | 120 | 280 | 600 |
| 16 | 0 | 400 | 720 |
| 17 | 0 | Still asleep, no leak yet | Not yet |

## 11. The leak drifts 15 minutes later each night

The leak moves 15 minutes later each night, starting at 200 minutes. The dry night stops the tight-cluster rule. Open Calendar the afternoon after the dry night, before the usual bedtime. One day later adds another 15 minutes.

Box: **410 min** after sleep (`6h 50m`). First ring at 395 min.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 200 |
| 2 | 215 |
| 3 | 230 |
| 4 | 245 |
| 5 | 260 |
| 6 | 275 |
| 7 | 290 |
| 8 | 305 |
| 9 | 320 |
| 10 | 335 |
| 11 | 350 |
| 12 | 365 |
| 13 | 380 |
| 14 | Dry night |

## 12. Early bedtimes and late bedtimes leak at different times

An early bedtime leaks 120 minutes after sleep. A bedtime 150 minutes later leaks 300 minutes after sleep. The coming bedtime is the early one, so the box uses 120.

Box: **120 min** after sleep (`2 hours`). First ring at 105 min.

| Night | Bedtime | Leak, minutes after sleep |
| --- | --- | --- |
| 1 | Early | 120 |
| 2 | 150 min later | 300 |
| 3 | Early | 120 |
| 4 | 150 min later | 300 |
| 5 | Early | 120 |
| 6 | 150 min later | 300 |
| 7 | Early | 120 |
| 8 | 150 min later | 300 |
| 9 | Early | 120 |
| 10 | 150 min later | 300 |
| 11 | Early | 120 |
| 12 | Early | 120 |
| 13 | Early | 120 |
| 14 | 150 min later | 300 |
| 15 | Early | 120 |
| 16 | Early | 120 |
| 17 | 150 min later | 300 |
| 18 | Early | 120 |
| 19 | Early | 120 |

Wake is 07:00 the next morning on every row.

## 13. Tonight's bedtime is much later than usual

The usual leak is 180 minutes after sleep. Tonight's bedtime is 210 minutes later than those nights. Open Calendar 10 minutes after that later Go to sleep, while still asleep. The simpler averages do not use this bedtime, and the delay stays 180 minutes after tonight's sleep.

Box: **180 min** after sleep (`3 hours`). First ring at 165 min.

| Night | Bedtime | Leak, minutes after sleep |
| --- | --- | --- |
| 1 | Usual | 180 |
| 2 | Usual | 180 |
| 3 | Usual | 180 |
| 4 | Usual | 180 |
| 5 | Usual | 180 |
| 6 | Usual | 180 |
| 7 | Usual | Dry night |
| 8 | 210 min later | Still asleep, no leak yet |

Wake on nights 1–7 is 660 minutes after the usual bedtime.

## 14. Weeknight after a weekend pattern

Twenty-eight nights, same bedtime. Friday and Saturday nights leak 280 minutes after sleep. Every other night leaks 100 minutes after sleep. Open Calendar on a Tuesday afternoon.

Box: **100 min** after sleep (`1h 40m`). First ring at 85 min.

| Which nights | Leak, minutes after sleep |
| --- | --- |
| Friday and Saturday | 280 |
| Sunday through Thursday | 100 |

Wake is 660 minutes after sleep on every night.

## 15. Friday night uses the weekend time

Same 28 nights as scenario 14. Open Calendar on a Friday afternoon. Friday night uses the weekend delay.

Box: **280 min** after sleep (`4h 40m`). First ring at 265 min.

## 16. The leak time steps to a new level

The first four nights leak at 100 minutes. The next four leak at 250 minutes. The recent level is the one in the box.

Box: **250 min** after sleep (`4h 10m`). First ring at 235 min.

| Night | Leak, minutes after sleep |
| --- | --- |
| 1 | 100 |
| 2 | 100 |
| 3 | 100 |
| 4 | 100 |
| 5 | 250 |
| 6 | 250 |
| 7 | 250 |
| 8 | 250 |
