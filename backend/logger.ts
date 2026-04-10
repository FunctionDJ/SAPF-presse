import { type } from "arktype";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const runId = new Date()
	.toISOString()
	.replaceAll(":", "-")
	.replaceAll(".", "-");
const runLogFilename = `${runId}-pid${process.pid}.log`;

const winstonLogger = winston.createLogger({
	transports: [
		new winston.transports.Console({}),
		new DailyRotateFile({
			dirname: "logs",
			filename: runLogFilename,
		}),
	],
});

export const loggingEmitter = new EventTarget();

export const LogEntry = type({
	level: "'info'|'warn'|'error'",
	message: "string",
});

// [FUTURE] maybe emit can be baked into winston as a transport

const emit = (level: "info" | "warn" | "error", message: string) => {
	const logEntry: typeof LogEntry.infer = { level, message };

	loggingEmitter.dispatchEvent(
		new CustomEvent("entry", {
			detail: logEntry,
		}),
	);
};

type Modules =
	| "Main"
	| "LoadState"
	| "ReplayWriter"
	| "SlippiController"
	| "StartggExport"
	| "StartggImport";

// TODO "meta" argument to winston is not present in console, but should be logged.

export const prefixLogger = (module?: Modules, additionalPrefix?: string) => {
	const assembleMessage = (message: string) => {
		const additionalPrefixPart =
			additionalPrefix === undefined ? "" : ` ${additionalPrefix}`;

		return `[${module ?? "Unknown"}${additionalPrefixPart}] ${message}`;
	};

	return {
		info(message: string, details?: unknown) {
			const assembled = assembleMessage(message);
			const messageWithDetailsLabel =
				details === undefined ? assembled : `${assembled}\nDetails:`;

			if (details === undefined) {
				winstonLogger.info(assembled);
			} else {
				winstonLogger.info(messageWithDetailsLabel, details);
			}

			emit("info", assembled);
		},
		warn(message: string, details?: unknown) {
			const assembled = assembleMessage(message);
			const messageWithDetailsLabel =
				details === undefined ? assembled : `${assembled}\nDetails:`;

			if (details === undefined) {
				winstonLogger.warn(assembled);
			} else {
				winstonLogger.warn(messageWithDetailsLabel, details);
			}

			emit("warn", assembled);
		},
		error(message: string, details?: unknown) {
			const assembled = assembleMessage(message);
			const messageWithDetailsLabel =
				details === undefined ? assembled : `${assembled}\nDetails:`;

			if (details === undefined) {
				winstonLogger.error(assembled);
			} else {
				winstonLogger.error(messageWithDetailsLabel, details);
			}

			emit("error", assembled);
		},
	};
};
