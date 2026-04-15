## self-service

- (!) needs to respect the stations "mode" and disable the station stuff completely, like controls, next up (?), current set status etc
- _maybe_ listen to loggingSubscription errors ?
- indicator für connection status mit backend
- nach set ende das gerade abgeschlossene set noch 1-2 minuten anzeigen aber mit "next set" button

## dashboard

- add a logging box for loggingSubscription where "info" is also stored with the other types
- show warning or "handwarmers (?)" when a slippi set is started without ports assignment / set started
- manual overrides für overlay (runde/pool etc)
- nach set ende das gerade abgeschlossene set noch 1-2 minuten anzeigen aber mit "next set" button
- tracken, ob eine station sich via self-service gerade im setup befindet und dann manual port assignment disablen, damit man sich mit manual ports assignment etc nicht in die quere kommt

## slippi schnittstelle

- wenn pause-quit und 3min vergangen dann checken ob jemand last-stock war. wenn ja, set zählen (je nach stocks, %)

## alle

- installation auf nem neuen windows PC testen
- UI crash detection / warning für backend
- meine credits (waffeln) mit "go play Project+!" klein und in die ecke packen, aber maybe nicht on-stream
- **(außer stream-layout) timer wenn ein set gecalled wird**

## stream-layout

- round display?
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

- das system soll in der lage sein, es zu verkraften, wenn ein set per self-service erst nach dem start eines matches gestartet wurde, also dass per slippi trotzdem immer die aktuellen characters und die stage gespeichert werden, falls erst danach ein match gestartet und dann character/stage für mindestens das overlay, aber im optimalfall für startgg vorhanden sind

## future

- support station management via /dashboard
  - create, edit, delete stations
  - manage slippi connections like IP and port
  - either startgg or this app needs to "own" the stations and synchronize with the other system (maybe, might actually not be needed)

- maybe slippi connection can be made automatic with some sort of discovery? ideally it would be as easy as "connect a wii, the system automatically detects it and starts recording replays locally, but you _can_ override/disable it if needed, but no need to type the IP yourself and hit connect, so it will also always try to recover/self-heal even with a different wii etc"

## concerns

- if a startgg set that's a currentSet in AM is accidentally removed from the stream queue, removed from the station, or assigned a non-side-stream station, can AM recover from that after the error is corrected or does it wipe state data?
