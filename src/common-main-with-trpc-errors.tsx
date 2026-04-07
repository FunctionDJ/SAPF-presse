import type { JSX } from "react";
import { TrpcErrorNotifications } from "./TrpcErrorNotifications.tsx";
import { commonMain } from "./common-main.tsx";

export const commonMainWithTrpcErrors = (AppComponent: () => JSX.Element) => {
	commonMain(AppComponent, (content) => (
		<>
			{content}
			<TrpcErrorNotifications />
		</>
	));
};
