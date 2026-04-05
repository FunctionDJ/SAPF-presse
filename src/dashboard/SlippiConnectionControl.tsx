import {
	CircularProgress,
	Button,
	IconButton,
	Paper,
	Popover,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { type } from "arktype";
import type { Station } from "../../backend/state";
import { trpc } from "../trpc-client";
import slippiLogo from "./SlippiLogo.svg";

export function SlippiConnectionControl({
	station,
}: {
	station: typeof Station.infer;
}) {
	const n = station.startggStationNumber;

	const [slippiAnchorEl, setSlippiAnchorEl] = useState<HTMLElement | null>(
		null,
	);
	const [editIp, setEditIp] = useState(station.slippi.ip);
	const [editPort, setEditPort] = useState(station.slippi.port);

	const editIpMutation = useMutation(
		trpc.dashboard.slippi.editIp.mutationOptions(),
	);
	const editPortMutation = useMutation(
		trpc.dashboard.slippi.editPort.mutationOptions(),
	);
	const submitSlippiIp = useDebouncedCallback(
		(ip: string) => editIpMutation.mutate({ stationNumber: n, ip }),
		500,
	);
	const submitSlippiPort = useDebouncedCallback(
		(port: number) => editPortMutation.mutate({ stationNumber: n, port }),
		500,
	);
	const startConnectionMutation = useMutation(
		trpc.dashboard.slippi.startStationConnection.mutationOptions(),
	);
	const stopConnectionMutation = useMutation(
		trpc.dashboard.slippi.stopStationConnection.mutationOptions(),
	);
	const resetErrorMutation = useMutation(
		trpc.dashboard.slippi.resetError.mutationOptions(),
	);

	const isConnected = station.slippi.slippiState.status === "connected";
	const isConnecting =
		station.slippi.slippiState.status === "connecting" ||
		station.slippi.slippiState.status === "reconnect-wait";
	const isInactive = !isConnected && !isConnecting;
	const canConnect = type("string.ip").allows(station.slippi.ip.trim());

	return (
		<Paper className="flex gap-3 items-center px-4 py-1.5" elevation={4}>
			<Tooltip
				title={
					station.slippi.slippiState.status === "error"
						? station.slippi.slippiState.errorMessage
						: ""
				}
			>
				<Typography variant="body2" color="textSecondary">
					{station.slippi.slippiState.status === "error"
						? "error (hover for details)"
						: station.slippi.slippiState.status === "connected"
							? `connected: ${station.slippi.slippiState.consoleNick}, v${station.slippi.slippiState.version}`
							: station.slippi.slippiState.status}
				</Typography>
			</Tooltip>
			<Tooltip title="Open Slippi Connection Management">
				<IconButton
					onClick={(e) => {
						setSlippiAnchorEl(e.currentTarget);
					}}
					sx={{
						position: "relative",
						backgroundColor: {
							error: "error.dark",
							connected: "#44A963",
							connecting: "warning.dark",
							disconnected: "grey.800",
							"reconnect-wait": "warning.dark",
						}[station.slippi.slippiState.status],
					}}
					className={
						station.slippi.slippiState.status === "error" ? "animate-pulse" : ""
					}
				>
					<img
						src={slippiLogo}
						alt="Slippi Logo"
						className={`h-6 w-6 ${isConnecting ? "opacity-40" : ""}`}
					/>
					{/* using the below instead of the indicator prop for <IconButton> because the indicator prop prevents interaction. this is also why the position-relative on the IconButton */}
					{isConnecting && (
						<CircularProgress className="absolute" sx={{ color: "white" }} />
					)}
				</IconButton>
			</Tooltip>

			<Popover
				open={slippiAnchorEl !== null}
				anchorEl={slippiAnchorEl}
				onClose={() => setSlippiAnchorEl(null)}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "center",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "center",
				}}
			>
				<div className="flex flex-col gap-5 p-4 w-72">
					<TextField
						label="IP Address"
						value={editIp}
						disabled={!isInactive}
						onChange={(e) => {
							if (/[^0-9.]/.test(e.target.value)) {
								return;
							}

							setEditIp(e.target.value);
							submitSlippiIp(e.target.value);
						}}
					/>
					<TextField
						label="Port"
						value={editPort}
						disabled={!isInactive}
						onChange={(e) => {
							if (/\D/.test(e.target.value)) {
								return;
							}

							const port = Number.parseInt(e.target.value, 10);
							setEditPort(port);
							submitSlippiPort(port);
						}}
					/>
					{isInactive ? (
						<>
							<Button
								variant="contained"
								color="success"
								disabled={startConnectionMutation.isPending || !canConnect}
								onClick={() => {
									startConnectionMutation.mutate({ stationNumber: n });
									setSlippiAnchorEl(null);
								}}
							>
								Connect
							</Button>
							{station.slippi.slippiState.status === "error" && (
								<Button
									variant="outlined"
									color="warning"
									disabled={resetErrorMutation.isPending}
									onClick={() => {
										resetErrorMutation.mutate({ stationNumber: n });
										setSlippiAnchorEl(null);
									}}
								>
									Reset Error
								</Button>
							)}
						</>
					) : (
						<Button
							variant="contained"
							color="error"
							disabled={stopConnectionMutation.isPending}
							onClick={() => {
								const confirmDisconnect = window.confirm(
									`Disconnect station ${n} from Slippi?`,
								);

								if (!confirmDisconnect) {
									return;
								}

								stopConnectionMutation.mutate({ stationNumber: n });
								setSlippiAnchorEl(null);
							}}
						>
							Disconnect
						</Button>
					)}
				</div>
			</Popover>
		</Paper>
	);
}
