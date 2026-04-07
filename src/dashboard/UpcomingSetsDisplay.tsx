import { Typography } from "@mui/material";
import type { UpcomingSet } from "../../backend/state";
import { entrantLabel } from "../../shared/entrant-utilities";
import { Round } from "../self-service/Round";

interface Props {
	sets: (typeof UpcomingSet.infer)[];
}

export function UpcomingSetsDisplay({ sets }: Props) {
	return (
		<div className="flex flex-col gap-1">
			<Typography variant="subtitle2">Upcoming Sets</Typography>
			{sets.length === 0 && (
				<Typography variant="body2" color="text.secondary">
					None
				</Typography>
			)}
			{sets.map((set) => (
				<div key={set.startggSetId} className="flex gap-2">
					<Typography variant="body2" color="text.secondary">
						{entrantLabel(set.entrantA)} vs. {entrantLabel(set.entrantB)}
					</Typography>
					<Typography variant="body2">
						— <Round set={set} />
					</Typography>
				</div>
			))}
		</div>
	);
}
