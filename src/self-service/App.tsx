import { CircularProgress, DialogContentText } from "@mui/material";
import { useSubscription } from "@trpc/tanstack-react-query";
import { Toaster } from "react-hot-toast";
import { trpc } from "../trpc-client";
import { StationComponent } from "./Station";

export function App() {
	const subscription = useSubscription(
		trpc.stateSubscription.subscriptionOptions(),
	);

	if (subscription.error) {
		return (
			<div>
				<p>error</p>
				<pre>{subscription.error.message}</pre>
			</div>
		);
	}

	if (subscription.data === undefined) {
		return (
			<div className="h-dvh grid place-content-center">
				<div className="flex gap-4 items-center">
					<CircularProgress />
					<DialogContentText>Loading...</DialogContentText>
				</div>
			</div>
		);
	}

	return (
		<div className="h-dvh border p-4 flex flex-col gap-8">
			<span className="font-black text-3xl text-center">
				Self-Service | made by waffeln
			</span>
			<div className="flex gap-4 grow overflow-scroll justify-center p-4">
				<StationComponent
					key={
						String(subscription.data.stations[0]?.startggStationNumber) +
						// this is probably a dirty hack but should ensure that on a currentSet update, the entire StationComponent is reset.
						// otherwise the "Reset" dialog is opens itself again after a reset because of react state bla reasons.
						String(subscription.data.stations[0]?.currentSet?.startggSetId ?? 0)
					}
					station={subscription.data.stations[0]!}
				/>
				<StationComponent
					key={
						String(subscription.data.stations[1]?.startggStationNumber) +
						// this is probably a dirty hack but should ensure that on a currentSet update, the entire StationComponent is reset.
						// otherwise the "Reset" dialog is opens itself again after a reset because of react state bla reasons.
						String(subscription.data.stations[1]?.currentSet?.startggSetId ?? 0)
					}
					station={subscription.data.stations[1]!}
				/>
				<StationComponent
					key={
						String(subscription.data.stations[2]?.startggStationNumber) +
						// this is probably a dirty hack but should ensure that on a currentSet update, the entire StationComponent is reset.
						// otherwise the "Reset" dialog is opens itself again after a reset because of react state bla reasons.
						String(subscription.data.stations[2]?.currentSet?.startggSetId ?? 0)
					}
					station={subscription.data.stations[2]!}
				/>
				<StationComponent
					key={
						String(subscription.data.stations[3]?.startggStationNumber) +
						// this is probably a dirty hack but should ensure that on a currentSet update, the entire StationComponent is reset.
						// otherwise the "Reset" dialog is opens itself again after a reset because of react state bla reasons.
						String(subscription.data.stations[3]?.currentSet?.startggSetId ?? 0)
					}
					station={subscription.data.stations[3]!}
				/>
			</div>
			<Toaster />
		</div>
	);
}
