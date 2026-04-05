import { Button, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { OverrideEntrant } from "../../backend/state";
import { trpc } from "../trpc-client";

const emptyEntrant: typeof OverrideEntrant.infer = {
	player1: {
		tag: "",
		pronouns: "",
		character: null,
		characterColor: null,
	},
	player2: null,
	score: null,
};

export function OverrideControls({
	stationNumber,
	entrantOverride,
}: {
	stationNumber: number;
	entrantOverride: [typeof OverrideEntrant.infer, typeof OverrideEntrant.infer];
}) {
	const [a, setA] = useState(entrantOverride[0]);
	const [b, setB] = useState(entrantOverride[1]);

	const mutation = useMutation(
		trpc.dashboard.setEntrantOverride.mutationOptions(),
	);

	const apply = () => {
		mutation.mutate({ stationNumber, entrantOverride: [a, b] });
	};

	const clear = () => {
		setA(emptyEntrant);
		setB(emptyEntrant);
	};

	return (
		<div className="flex flex-col gap-2">
			<Typography variant="subtitle2">Entrant Override</Typography>
			<div className="flex gap-2">
				<TextField
					label="Entrant A Tag"
					size="small"
					value={a.player1.tag}
					onChange={(e) =>
						setA({
							...a,
							player1: { ...a.player1, tag: e.target.value },
						})
					}
				/>
				<TextField
					label="Entrant A Score"
					size="small"
					type="number"
					className="w-24"
					value={a.score ?? ""}
					onChange={(e) =>
						setA({
							...a,
							score: e.target.value === "" ? null : Number(e.target.value),
						})
					}
				/>
				<TextField
					label="Entrant B Tag"
					size="small"
					value={b.player1.tag}
					onChange={(e) =>
						setB({
							...b,
							player1: { ...b.player1, tag: e.target.value },
						})
					}
				/>
				<TextField
					label="Entrant B Score"
					size="small"
					type="number"
					className="w-24"
					value={b.score ?? ""}
					onChange={(e) =>
						setB({
							...b,
							score: e.target.value === "" ? null : Number(e.target.value),
						})
					}
				/>
			</div>
			<div className="flex gap-2">
				<Button variant="contained" size="small" onClick={apply}>
					Apply Override
				</Button>
				<Button variant="outlined" size="small" onClick={clear}>
					Clear
				</Button>
			</div>
		</div>
	);
}
