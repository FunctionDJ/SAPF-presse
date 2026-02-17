import { type } from "arktype";

export const id = type("number.integer >= 0");

export const SetState = id.pipe((val) => {
	switch (val) {
		case 1:
			return "created";
		case 2:
			return "active";
		case 3:
			return "completed";
		case 4:
			return "ready";
		case 5:
			return "invalid";
		case 6:
			return "called";
		case 7:
			return "queued";
		default:
			return "unknown";
	}
});
