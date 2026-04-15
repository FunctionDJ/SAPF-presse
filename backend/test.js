/* eslint-disable no-console */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
	ConnectionEvent,
	ConnectionStatus,
	ConsoleConnection,
} = require("@slippi/slippi-js/node");

const conn = new ConsoleConnection({ autoReconnect: true });

conn.on(ConnectionEvent.STATUS_CHANGE, (status) => {
	console.log(`New status: ${ConnectionStatus[status]}`);
});

await conn.connect("10.0.2.55", 51441, false, 1000);
setTimeout(() => process.exit(0), 120_000); // stop after 2 minutes
