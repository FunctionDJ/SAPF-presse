import {
	Card,
	CardContent,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { Station } from "../../backend/state";
import { trpc } from "../trpc-client";
import { CurrentSetDisplay } from "./CurrentSetDisplay";
import { OverrideControls } from "./OverrideControls";
import { PortsControl } from "./PortsControl";
import { SlippiConnectionControl } from "./SlippiConnectionControl.tsx";
import { UpcomingSetsDisplay } from "./UpcomingSetsDisplay";

export function StationPanel({ station }: { station: typeof Station.infer }) {
	const n = station.startggStationNumber;

	const [bestOf, setBestOf] = useState(station.bestOf);
	const bestOfMutation = useMutation(
		trpc.dashboard.setBestOf.mutationOptions(),
	);
	const submitBestOf = useDebouncedCallback(
		(val: number) => bestOfMutation.mutate({ stationNumber: n, bestOf: val }),
		500,
	);

	const [basicText, setBasicText] = useState(station.basicTextOverride);
	const basicTextMutation = useMutation(
		trpc.dashboard.setBasicTextOverride.mutationOptions(),
	);
	const submitBasicText = useDebouncedCallback(
		(text: string) =>
			basicTextMutation.mutate({
				stationNumber: n,
				basicTextOverride: text,
			}),
		500,
	);

	const modeMutation = useMutation(trpc.dashboard.setMode.mutationOptions());

	return (
		<Card>
			<CardContent className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<Typography variant="h6">Station {n}</Typography>

					<div className="flex gap-3 items-center">
						<SlippiConnectionControl station={station} />

						<Tooltip title="Currently only used for start.gg mode where auto-reporting with Slippi uses this to determine when the set is over.">
							<TextField
								label="Best Of"
								type="number"
								size="small"
								className="w-24"
								value={bestOf}
								onChange={(e) => {
									const val = Number(e.target.value);
									setBestOf(val);
									submitBestOf(val);
								}}
								slotProps={{ htmlInput: { min: 1, step: 2 } }}
							/>
						</Tooltip>

						<Tooltip
							placement="top"
							title="Modes other than start.gg disable using start.gg data and Slippi auto-reporting. Replay are always recorded."
						>
							<FormControl size="small" className="w-50">
								<InputLabel>Data Mode</InputLabel>
								<Select
									value={station.mode}
									onChange={(e) =>
										modeMutation.mutate({
											stationNumber: n,
											mode: e.target.value,
										})
									}
									sx={{
										backgroundColor:
											station.mode === "startgg"
												? "transparent"
												: "warning.dark",
									}}
								>
									<MenuItem value="startgg">start.gg (automatic)</MenuItem>
									<MenuItem value="basic-text-override">
										Simple Text Override
									</MenuItem>
									<MenuItem value="entrant-override">Custom Players</MenuItem>
								</Select>
							</FormControl>
						</Tooltip>
					</div>
				</div>

				<Divider />

				<PortsControl station={station} />

				<div className="flex gap-2">
					{station.mode === "basic-text-override" && (
						<TextField
							label="Text Override"
							size="small"
							className="grow"
							value={basicText}
							onChange={(e) => {
								setBasicText(e.target.value);
								submitBasicText(e.target.value);
							}}
						/>
					)}
				</div>

				{station.mode === "entrant-override" && (
					<OverrideControls
						stationNumber={n}
						entrantOverride={station.entrantOverride}
					/>
				)}

				<Divider />

				<CurrentSetDisplay
					currentSet={station.currentSet}
					stationNumber={station.startggStationNumber}
				/>
				<UpcomingSetsDisplay sets={station.upcomingSets} />
			</CardContent>
		</Card>
	);
}
