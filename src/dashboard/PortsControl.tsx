import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { PlayerInCurrentSet, Ports, Station } from "../../backend/state";
import { getPlayersFromCurrentSet } from "../../shared/entrant-utils";
import { trpc } from "../trpc-client";

export function PortsControl({ station }: { station: typeof Station.infer }) {
	const [input, setInput] = useState(station.ports);

	useEffect(() => {
		setInput(station.ports);
	}, [station.ports]);

	const mutation = useMutation(trpc.dashboard.setPorts.mutationOptions());

	if (!station.currentSet) {
		return (
			<Typography variant="body2" color="text.secondary">
				No current set — port assignment unavailable
			</Typography>
		);
	}

	const players = getPlayersFromCurrentSet(station.currentSet);
	const assignedIds = input.filter((id): id is number => id !== null);
	const isValid = assignedIds.length === players.length;

	const submit = (next: typeof Ports.infer) => {
		mutation.mutate({
			stationNumber: station.startggStationNumber,
			ports: next,
		});
	};

	const availableForPort = (
		portIndex: number,
		allPlayers: (typeof PlayerInCurrentSet.infer)[],
	) => {
		const currentId = input[portIndex];
		return allPlayers.filter(
			(p) =>
				p.startggParticipantId !== null &&
				(p.startggParticipantId === currentId ||
					!assignedIds.includes(p.startggParticipantId)),
		);
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<Typography variant="subtitle2">
					{station.mode === "startgg"
						? "Ports"
						: "Ports (inactive because of mode)"}
				</Typography>
				{!isValid && (
					<Typography variant="caption" color="error">
						Assign all {players.length} players to a port, otherwise
						auto-reporting won&apos;t work
					</Typography>
				)}
			</div>
			<div className="flex gap-2">
				{([0, 1, 2, 3] as const).map((i) => (
					<FormControl key={i} size="small" className="min-w-28">
						<InputLabel>Port {i + 1}</InputLabel>
						<Select
							className="w-30"
							label={`Port ${i + 1}`}
							value={input[i] ?? ""}
							onChange={(e) => {
								const val = e.target.value as number | "";
								const next = [...input] as typeof Ports.infer;
								next[i] = val === "" ? null : val;
								setInput(next);
								const nextAssigned = next.filter(
									(id): id is number => id !== null,
								);
								if (nextAssigned.length === players.length) {
									submit(next);
								}
							}}
						>
							<MenuItem value="">
								<em>None</em>
							</MenuItem>
							{availableForPort(i, players).map((p) => (
								<MenuItem
									key={p.startggParticipantId}
									value={p.startggParticipantId ?? undefined}
								>
									{p.tag}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				))}
			</div>
		</div>
	);
}
