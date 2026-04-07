import {
	Edit,
	HourglassBottom,
	Pending,
	PlayCircle,
	RestartAlt,
	SignalCellularConnectedNoInternet0Bar,
} from "@mui/icons-material";
import {
	Button,
	Card,
	CardContent,
	createTheme,
	Table,
	TableBody,
	TableCell,
	TableRow,
	ThemeProvider,
	Typography,
} from "@mui/material";
import { green, purple } from "@mui/material/colors";
import { useState } from "react";
import type { Station } from "../../backend/state";
import { mainThemeConfig } from "./main-theme";
import { RunningSetRow } from "./RunningSetRow";
import { StationDialogs } from "./StationDialogs";
import { Timer } from "./Timer";
import { Round } from "./Round";

interface Props {
	station: typeof Station.infer;
}

const stationTheme = createTheme({
	...mainThemeConfig,
	typography: {
		...mainThemeConfig.typography,
		allVariants: {
			color: "white",
		},
	},
});

const getCardBackgroundColor = (
	currentSet: typeof Station.infer.currentSet,
) => {
	if (!currentSet) {
		return "grey.900";
	}

	if (currentSet.state === "active") {
		return purple[800];
	}

	return green[600];
};

export const StationComponent = ({ station }: Props) => {
	const [hwDialogOpen, setHwDialogOpen] = useState(false);
	const [portDialogOpen, setPortDialogOpen] = useState(false);
	const [resetDialogOpen, setResetDialogOpen] = useState(false);
	const { currentSet } = station;

	const cardBackground = getCardBackgroundColor(currentSet);

	return (
		<div>
			{currentSet !== null && (
				<StationDialogs
					currentSet={currentSet}
					ports={station.ports}
					hwDialogOpen={hwDialogOpen}
					setHwDialogOpen={setHwDialogOpen}
					portDialogOpen={portDialogOpen}
					setPortDialogOpen={setPortDialogOpen}
					resetDialogOpen={resetDialogOpen}
					setResetDialogOpen={setResetDialogOpen}
					stationId={station.startggStationNumber}
				/>
			)}
			<ThemeProvider theme={stationTheme}>
				<Card sx={{ bgcolor: "grey.900" }}>
					<CardContent sx={{ bgcolor: cardBackground }}>
						<Typography>Station {station.startggStationNumber}</Typography>
						<div>
							{currentSet ? (
								currentSet.state === "active" ? (
									<div className="flex justify-between">
										<Typography>
											<HourglassBottom /> Set in progress
										</Typography>
										<Typography>
											{currentSet.startedAt && (
												<Timer startDate={new Date(currentSet.startedAt)} />
											)}
										</Typography>
									</div>
								) : (
									<Typography>
										<Pending className="animate-pulse" /> Ready for next set
									</Typography>
								)
							) : (
								<Typography>
									<SignalCellularConnectedNoInternet0Bar /> No sets queued
								</Typography>
							)}
						</div>
					</CardContent>
					<CardContent>
						<Table>
							<TableBody>
								<TableRow>
									<TableCell colSpan={3} align="center">
										<Typography>
											{currentSet === null ? (
												"[No currentSet]"
											) : (
												<Round set={currentSet} />
											)}
										</Typography>
									</TableCell>
								</TableRow>
								<RunningSetRow entrant={currentSet?.entrantA} />
								<TableRow>
									<TableCell
										colSpan={3}
										align="center"
										sx={{ fontStyle: "italic" }}
									>
										<Typography>vs</Typography>
									</TableCell>
								</TableRow>
								<RunningSetRow entrant={currentSet?.entrantB} />
							</TableBody>
						</Table>
					</CardContent>
					{currentSet !== null && (
						<CardContent className="flex flex-col gap-4">
							{currentSet.state !== "active" && (
								<Button
									onClick={() => {
										setHwDialogOpen(true);
									}}
									startIcon={<PlayCircle />}
								>
									TOUCH TO START
								</Button>
							)}
							{currentSet.state === "active" && (
								<>
									<Button
										color="secondary"
										variant="outlined"
										onClick={() => {
											setPortDialogOpen(true);
										}}
										startIcon={<Edit />}
									>
										change ports
									</Button>
									<Button
										color="warning"
										variant="outlined"
										onClick={() => {
											setResetDialogOpen(true);
										}}
										startIcon={<RestartAlt />}
									>
										Reset set
									</Button>
								</>
							)}
						</CardContent>
					)}
				</Card>

				<Card sx={{ bgcolor: "grey.700" }} className="mt-10">
					<CardContent>
						<Typography className="text-center">Next up</Typography>
						<Typography>Foo vs Bar</Typography>
						<Typography>Foo vs Bar</Typography>
						<Typography>Foo vs Bar</Typography>
						<Typography>Foo vs Bar</Typography>
					</CardContent>
				</Card>
			</ThemeProvider>
		</div>
	);
};
