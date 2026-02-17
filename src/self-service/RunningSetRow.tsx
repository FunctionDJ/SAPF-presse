import { TableCell, TableRow, Typography } from "@mui/material";
import type { Slot } from "../../shared/startgg-schemas";

interface Props {
	slot: Slot | undefined;
}

export const RunningSetRow = ({ slot }: Props) => (
	<TableRow>
		<TableCell align="right">
			<Typography>{slot?.standing.stats.score.value}</Typography>
		</TableCell>
		<TableCell></TableCell>
		<TableCell>
			<div style={{ width: 200 }}>
				<Typography noWrap>{slot?.entrant.name}</Typography>
			</div>
			{slot?.entrant.team !== null && (
				<div style={{ width: 200 }}>
					<Typography fontSize={18} color="grey" noWrap>
						{slot?.entrant.participants.map((p) => p.gamerTag).join(", ")}
					</Typography>
				</div>
			)}
		</TableCell>
	</TableRow>
);
