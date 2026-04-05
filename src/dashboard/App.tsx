import {
	CircularProgress,
	createTheme,
	CssBaseline,
	ThemeProvider,
} from "@mui/material";
import { useSubscription } from "@trpc/tanstack-react-query";
import { trpc } from "../trpc-client";
import { CenterTextControl } from "./CenterTextControl";
import { StationPanel } from "./StationPanel";

const darkTheme = createTheme({
	palette: { mode: "dark" },
	typography: { fontSize: 14 },
});

export function App() {
	const subscription = useSubscription(
		trpc.stateSubscription.subscriptionOptions(),
	);

	if (subscription.error) {
		return (
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<div className="p-4">
					<p>Connection error</p>
					<pre>{subscription.error.message}</pre>
				</div>
			</ThemeProvider>
		);
	}

	if (!subscription.data) {
		return (
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<div className="h-dvh grid place-content-center">
					<CircularProgress />
				</div>
			</ThemeProvider>
		);
	}

	const { data: state } = subscription;

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<div className="p-4 flex flex-col gap-4">
				<h1 className="text-2xl font-bold">SAPFpresse Dashboard</h1>
				<CenterTextControl value={state.centerText} />
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{state.stations.map((station) => (
						<StationPanel
							key={station.startggStationNumber}
							station={station}
						/>
					))}
				</div>
			</div>
		</ThemeProvider>
	);
}
