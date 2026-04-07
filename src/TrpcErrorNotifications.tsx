import { Alert, Snackbar } from "@mui/material";
import { useSyncExternalStore } from "react";
import {
	clearTrpcErrors,
	listenerContainer,
	tRPCErrorRecord,
} from "./trpc-error-store.ts";

export const TrpcErrorNotifications = () => {
	const record = useSyncExternalStore(
		(listener) => {
			listenerContainer.listener = listener;
			return () => {
				listenerContainer.listener = () => {
					/** no-op */
				};
			};
		},
		() => tRPCErrorRecord,
	);

	return (
		<Snackbar open={record !== null}>
			<Alert
				className="items-center max-w-lg"
				severity="error"
				variant="filled"
				onClose={clearTrpcErrors}
			>
				{record?.path != null ? (
					<>
						{record.path}:
						<br />
						{record.summary}
					</>
				) : (
					record?.summary
				)}
			</Alert>
		</Snackbar>
	);
};
