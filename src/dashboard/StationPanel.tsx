import {
	Button,
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
		(value: number) =>
			bestOfMutation.mutate({ stationNumber: n, bestOf: value }),
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

	const [commentators, setCommentators] = useState(station.commentators);
	const commentatorsMutation = useMutation(
		trpc.dashboard.setCommentators.mutationOptions(),
	);
	const submitCommentators = useDebouncedCallback(
		(text: string) =>
			commentatorsMutation.mutate({
				stationNumber: n,
				commentators: text,
			}),
		500,
	);

	const highlightedMutation = useMutation(
		trpc.dashboard.setHighlighted.mutationOptions(),
	);

	const modeMutation = useMutation(trpc.dashboard.setMode.mutationOptions());

	return (
		<Card
			sx={
				station.highlighted
					? {
							borderWidth: 2,
							borderStyle: "solid",
							borderColor: "warning.main",
						}
					: undefined
			}
		>
			<CardContent className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Typography variant="h6">Station {n}</Typography>
						<Button
							size="small"
							variant={station.highlighted ? "contained" : "outlined"}
							color="warning"
							onClick={() =>
								highlightedMutation.mutate({
									stationNumber: n,
									highlighted: !station.highlighted,
								})
							}
						>
							{station.highlighted ? "Highlighted" : "Highlight"}
						</Button>
					</div>

					<div className="flex gap-3 items-center">
						<SlippiConnectionControl station={station} />

						<Tooltip title="Currently only used for start.gg mode where auto-reporting with Slippi uses this to determine when the set is over.">
							<TextField
								label="Best Of"
								type="number"
								size="small"
								className="w-24"
								value={bestOf}
								onChange={(event) => {
									const value = Number(event.target.value);
									setBestOf(value);
									submitBestOf(value);
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
									onChange={(event) =>
										modeMutation.mutate({
											stationNumber: n,
											mode: event.target.value,
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

						{station.mode === "startgg" && station.currentSet !== null && (
							<Typography variant="body2" color="text.secondary">
								Score: {station.currentSet.entrantA.score} -{" "}
								{station.currentSet.entrantB.score}
							</Typography>
						)}
					</div>
				</div>

				<Divider />

				{/* this key re-renders and therefore resets inputs to current state when ports in global state are changed */}
				<PortsControl key={JSON.stringify(station.ports)} station={station} />

				<div className="flex gap-2">
					{station.mode === "basic-text-override" && (
						<TextField
							label="Text Override"
							size="small"
							className="grow"
							value={basicText}
							onChange={(event) => {
								setBasicText(event.target.value);
								submitBasicText(event.target.value);
							}}
						/>
					)}

					{/* <TextField
						label="Commentators"
						size="small"
						className="grow"
						value={commentators}
						onChange={(event) => {
							setCommentators(event.target.value);
							submitCommentators(event.target.value);
						}}
					/> */}
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
