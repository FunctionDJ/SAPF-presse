import {
	Button,
	CircularProgress,
	createTheme,
	CssBaseline,
	ThemeProvider,
} from "@mui/material";
import { useSubscription } from "@trpc/tanstack-react-query";
import reactHotToast, { ToastBar, Toaster } from "react-hot-toast";
import { trpc } from "../trpc-client";
import { CenterTextControl } from "./CenterTextControl";
import { DashboardSettingsControl } from "./DashboardSettingsControl";
import { StationPanel } from "./StationPanel";

const darkTheme = createTheme({
	palette: { mode: "dark" },
	typography: { fontSize: 14 },
});

export function App() {
	const subscription = useSubscription(
		trpc.stateSubscription.subscriptionOptions(),
	);

	useSubscription(
		trpc.loggerSubscription.subscriptionOptions(undefined, {
			onData: (logEntry) => {
				if (logEntry.level === "warn") {
					reactHotToast(`Warning: ${logEntry.message}`);
				}

				if (logEntry.level === "error") {
					reactHotToast.error(`Error: ${logEntry.message}`);
				}
			},
		}),
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
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold">Automeleec Dashboard</h1>
					<DashboardSettingsControl state={state} />
				</div>
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
			<Toaster
				toastOptions={{
					duration: 20000,
				}}
			>
				{(t) => (
					<ToastBar toast={t}>
						{({ icon, message }) => (
							<div className="flex items-center gap-2">
								{icon}
								<div>{message}</div>
								<Button
									size="small"
									onClick={() => reactHotToast.dismiss(t.id)}
								>
									Dismiss
								</Button>
							</div>
						)}
					</ToastBar>
				)}
			</Toaster>
		</ThemeProvider>
	);
}
