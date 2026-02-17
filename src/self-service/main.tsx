import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "../index.css";
import { ThemeProvider } from "@mui/material";
import { mainTheme } from "./mainTheme.tsx";
import { queryClient } from "../trpc-client.ts";

const root = document.getElementById("root");

if (root) {
	createRoot(root).render(
		<StrictMode>
			<ThemeProvider theme={mainTheme}>
				<QueryClientProvider client={queryClient}>
					<App />
				</QueryClientProvider>
			</ThemeProvider>
		</StrictMode>,
	);
}
