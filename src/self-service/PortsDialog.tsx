import { Close, Sync } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState, type Dispatch } from "react";
import type { CurrentSet, Ports } from "../../backend/state";
import {
	entrantLabel,
	getPlayersFromCurrentSet,
} from "../../shared/entrant-utilities";
import { trpcVanilla } from "../trpc-client";
import { PortInput } from "./PortInput";

interface Props {
	currentSet: typeof CurrentSet.infer;
	open: boolean;
	setOpen: Dispatch<boolean>;
	ports: typeof Ports.infer;
	stationNumber: number;
}

// [FUTURE] Schima: Das einzige was mir noch einfallen würde ist noch die farben von den melee ingame ports zu verwenden
export const PortsDialog = ({
	currentSet,
	open,
	setOpen,
	ports,
	stationNumber,
}: Props) => {
	const players = getPlayersFromCurrentSet(currentSet);
	const [portsInput, setPortsInput] = useState(ports);

	const onClose = () => {
		setOpen(false);
		setPortsInput(ports);
	};

	const startSetMutation = useMutation({
		mutationFn: () =>
			trpcVanilla.selfService.markSetInProgress.mutate({
				setId: currentSet.startggSetId,
			}),
	});

	const updatePortsMutation = useMutation({
		mutationFn: () =>
			trpcVanilla.selfService.updatePorts.mutate({
				stationNumber,
				ports: portsInput,
			}),
	});

	const disabled =
		players.length !== portsInput.filter((port) => port !== null).length;

	return (
		<Dialog open={open} onClose={onClose} scroll="body" fullWidth maxWidth="lg">
			<DialogTitle>
				{currentSet.state === "active"
					? "Updating ports for "
					: "Starting set "}
				{entrantLabel(currentSet.entrantA)} vs.{" "}
				{entrantLabel(currentSet.entrantB)}
			</DialogTitle>
			<DialogContent className="flex flex-col gap-6 bg-gray-200 p-4!">
				{players.map((player) => (
					<PortInput
						key={player.startggParticipantId}
						player={player}
						portsInput={portsInput}
						setPortsInput={setPortsInput}
					/>
				))}
			</DialogContent>
			<DialogActions className="flex flex-col gap-2">
				<Typography variant="h6" color="warning">
					{disabled ? "All players need a port to continue." : "\u200B"}
				</Typography>
				<div className="flex gap-10 justify-center">
					<Button
						onClick={onClose}
						color="secondary"
						size="large"
						startIcon={<Close />}
						variant="contained"
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						size="large"
						loading={
							startSetMutation.isPending || updatePortsMutation.isPending
						}
						onClick={() => {
							const isStarted = currentSet.state === "active";

							updatePortsMutation.mutate(undefined, {
								onSuccess: () => {
									if (isStarted) {
										onClose();
									} else {
										startSetMutation.mutate(undefined, {
											onSuccess: () => onClose(),
										});
									}
								},
							});
						}}
						disabled={disabled}
						startIcon={<Sync />}
						color="success"
					>
						{currentSet.state === "active" ? "update ports" : "START SET"}
					</Button>
				</div>
			</DialogActions>
		</Dialog>
	);
};
