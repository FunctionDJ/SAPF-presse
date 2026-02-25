import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, type JSX } from "react";
import { createRoot } from "react-dom/client";
import { queryClient } from "./trpc-client.ts";

export const commonMain = (AppComponent: () => JSX.Element) => {
	const root = document.getElementById("root");

	if (!root) {
		window.alert("Root element not found");
		return;
	}

	createRoot(root).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<AppComponent />
			</QueryClientProvider>
		</StrictMode>,
	);
};
