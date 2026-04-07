import { Chip, Typography } from "@mui/material";
import type { CurrentSet } from "../../backend/state";
import { entrantLabel } from "../../shared/entrant-utilities";
import { Round } from "../self-service/Round";

export function CurrentSetDisplay({
	currentSet,
	stationNumber,
}: {
	currentSet: typeof CurrentSet.infer | null;
	stationNumber: number;
}) {
	if (!currentSet) {
		return (
			<Typography variant="body2" color="warning.main">
				No current set in state (no active set found on startgg for station{" "}
				{stationNumber}), score data from startgg ignored!
			</Typography>
		);
	}

	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-2">
				<Typography variant="subtitle2">Current Set (Startgg)</Typography>
				<Chip
					label={currentSet.state === "active" ? "running" : currentSet.state}
					size="small"
					color={currentSet.state === "active" ? "success" : "default"}
				/>
				<Chip
					label={<Round set={currentSet} />}
					size="small"
					variant="outlined"
				/>
			</div>
			<Typography variant="body2">
				{entrantLabel(currentSet.entrantA)}
				{currentSet.entrantA.score !== null &&
					` (${currentSet.entrantA.score})`}{" "}
				vs. {entrantLabel(currentSet.entrantB)}
				{currentSet.entrantB.score !== null &&
					` (${currentSet.entrantB.score})`}
			</Typography>
			<Typography variant="caption" color="text.secondary">
				Stage: {currentSet.slippiStage ?? "(none)"}
			</Typography>
		</div>
	);
}
