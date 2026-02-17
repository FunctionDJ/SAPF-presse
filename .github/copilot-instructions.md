---
applyTo: "**"
---

this project is an automatic reporting and stream overlay system for smash bros melee. it takes some information from the self-service portal, the start.gg graphql API, and the match results from slippi using slippi-js from the consoles to feed into the stream overlays and to automatically update the sets on start.gg. the system will have only one instance running at the tournament, locally (no traffic from the internet, no forwarded ports, and the only outgoing traffic will be requests to start.gg). no TLS or security measures like rate limiting or auth are needed.

i favour minimalism and having as few lines of code as reasonably possible while not sacrificing readability, correctness or reliability.
