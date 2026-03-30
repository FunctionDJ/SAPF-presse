## self-service

- next up / fetch by stream queue + split by station
- indicator für connection status mit backend
- nach set ende das gerade abgeschlossene set noch 1-2 minuten anzeigen aber mit "next set" button

## dashboard

- bauen
- manual overrides für overlay (spieler, characters + costume, score, runde/pool etc)
- nach set ende das gerade abgeschlossene set noch 1-2 minuten anzeigen aber mit "next set" button

## slippi schnittstelle

- wenn pause-quit und 3min vergangen dann checken ob jemand last-stock war. wenn ja, set zählen (je nach stocks, %)

## alle

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

- backend mit bun testen und wenn es keine probleme wegen bun gibt dann darauf committen und dann
  - package management umstellen wenn da noch was zu tun ist
  - package.json scripts umstellen und tsx entfernen
  - backend server auf bun apis umstellen und auch sonstige node APIs im projekt

- trpc/tanstack-react-query benutzen
