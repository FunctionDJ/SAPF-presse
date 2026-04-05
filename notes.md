## self-service

- next up / fetch by stream queue + split by station
- indicator für connection status mit backend
- nach set ende das gerade abgeschlossene set noch 1-2 minuten anzeigen aber mit "next set" button

## dashboard

- manual overrides für overlay (characters + costume, score, runde/pool etc)
- nach set ende das gerade abgeschlossene set noch 1-2 minuten anzeigen aber mit "next set" button
- tracken, ob eine station sich via self-service gerade im setup befindet und dann manual port assignment disablen, damit man sich mit manual ports assignment etc nicht in die quere kommt

## slippi schnittstelle

- wenn pause-quit und 3min vergangen dann checken ob jemand last-stock war. wenn ja, set zählen (je nach stocks, %)

## alle

- UI crash detection / warning für backend
- meine credits (waffeln) mit "go play Project+!" klein und in die ecke packen, aber maybe nicht on-stream
- **(außer stream-layout) timer wenn ein set gecalled wird**

## stream-layout

- bauen
- stretch goal: 2-station und 1-station varianten mit dashboard toggle dafür
- indicator für connection status mit backend
- nach set ende das gerade abgeschlossene set noch 1-2 minuten anzeigen und danach "next set" info (queue)

## links

slippi replay bundles
https://drive.google.com/drive/folders/15FBqMJPd6tMrFkEX-wJAKmXPLWZ4gM69

https://github.com/jmlee337/replay-manager-for-slippi

https://github.com/jmlee337/discord-tournament-bot

https://github.com/SSBDoppler/slippi-hud

https://github.com/Readek/Melee-Stream-Tool

- rename to sapfladen???

- das system soll in der lage sein, es zu verkraften, wenn ein set per self-service erst nach dem start eines matches gestartet wurde, also dass per slippi trotzdem immer die aktuellen characters und die stage gespeichert werden, falls erst danach ein match gestartet und dann character/stage für mindestens das overlay, aber im optimalfall für startgg vorhanden sind

- trpc/tanstack-react-query benutzen wo es noch nicht benutzt wird

## future

- support station management via /dashboard
  - create, edit, delete stations
  - manage slippi connections like IP and port
  - either startgg or this app needs to "own" the stations and synchronize with the other system (maybe, might actually not be needed)

## concerns

- if a startgg set that's a currentSet in sapfpresse is accidentally removed from the stream queue, removed from the station, or assigned a non-side-stream station, can sapfpresse recover from that after the error is corrected or does it wipe state data?
