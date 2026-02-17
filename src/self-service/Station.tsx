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
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { mainThemeConfig } from "./mainTheme";
import { RunningSetRow } from "./RunningSetRow";
import type { TSet } from "../../shared/startgg-schemas";
import { StationDialogs } from "./StationDialogs";
import { Timer } from "./Timer";
import { trpc } from "../trpc-client";

interface Props {
	id: number;
	sets: TSet[];
}

// TODO slippi connection status with icon etc

const stationTheme = createTheme({
	...mainThemeConfig,
	typography: {
		...mainThemeConfig.typography,
		allVariants: {
			color: "white",
		},
	},
});

export const Station = ({ id, sets }: Props) => {
	const [hwDialogOpen, setHwDialogOpen] = useState(false);
	const [portDialogOpen, setPortDialogOpen] = useState(false);
	const [resetDialogOpen, setResetDialogOpen] = useState(false);
	const firstSet = sets.at(0);

	const portsQuery = useQuery({
		queryKey: ["ports"],
		refetchInterval: 5000,
		queryFn: async () => trpc.getAllPorts.query(),
		structuralSharing: (oldData, newData) => {
			if (JSON.stringify(oldData) === JSON.stringify(newData)) {
				return oldData;
			}
			return newData;
		},
	});

	return (
		<div>
			{firstSet !== undefined && portsQuery.isSuccess && (
				<StationDialogs
					set={firstSet}
					ports={portsQuery.data[id] ?? [null, null, null, null]}
					hwDialogOpen={hwDialogOpen}
					setHwDialogOpen={setHwDialogOpen}
					portDialogOpen={portDialogOpen}
					setPortDialogOpen={setPortDialogOpen}
					resetDialogOpen={resetDialogOpen}
					setResetDialogOpen={setResetDialogOpen}
					stationId={id}
				/>
			)}
			<ThemeProvider theme={stationTheme}>
				<Card sx={{ bgcolor: "grey.900" }}>
					<CardContent
						sx={{
							bgcolor: firstSet
								? firstSet.state === "active"
									? purple[800]
									: green[600]
								: undefined,
						}}
					>
						<Typography>Station {id}</Typography>
						<div>
							{firstSet ? (
								firstSet.state === "active" ? (
									<div className="flex justify-between">
										<Typography>
											<HourglassBottom /> Set in progress
										</Typography>
										<Typography>
											{firstSet.startedAt && (
												<Timer startDate={firstSet.startedAt} />
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
											Pool {firstSet?.phaseGroup.displayIdentifier ?? "-"}
										</Typography>
									</TableCell>
								</TableRow>
								<RunningSetRow slot={firstSet?.slots[0]} />
								<TableRow>
									<TableCell
										colSpan={3}
										align="center"
										sx={{ fontStyle: "italic" }}
									>
										<Typography>vs</Typography>
									</TableCell>
								</TableRow>
								<RunningSetRow slot={firstSet?.slots[1]} />
							</TableBody>
						</Table>
					</CardContent>
					{firstSet !== undefined && (
						<CardContent className="flex flex-col gap-4">
							{firstSet.state !== "active" && (
								<Button
									onClick={() => {
										setHwDialogOpen(true);
									}}
									startIcon={<PlayCircle />}
								>
									TOUCH TO START
								</Button>
							)}
							{firstSet.state === "active" && (
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
