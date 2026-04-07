import { Typography } from "@mui/material";
import type { OverrideEntrant } from "../../backend/state";
import { EntrantOverride } from "./EntrantOverride";

export function OverrideControls({
	stationNumber,
	entrantOverride,
}: {
	stationNumber: number;
	entrantOverride: [typeof OverrideEntrant.infer, typeof OverrideEntrant.infer];
}) {
	return (
		<div className="flex flex-col gap-2">
			<Typography variant="subtitle2">Entrant Override</Typography>
			<div className="flex flex-col gap-2">
				<EntrantOverride
					entrant={entrantOverride[0]}
					side="left"
					stationNumber={stationNumber}
				/>
				<EntrantOverride
					entrant={entrantOverride[1]}
					side="right"
					stationNumber={stationNumber}
				/>
			</div>
		</div>
	);
}
