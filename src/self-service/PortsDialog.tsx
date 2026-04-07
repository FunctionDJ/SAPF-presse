import { Sync } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
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

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>
				{currentSet.state === "active"
					? "Updating ports for "
					: "Starting set "}
				{entrantLabel(currentSet.entrantA)} vs.{" "}
				{entrantLabel(currentSet.entrantB)}
			</DialogTitle>
			<DialogContent>
				{players.map((player) => (
					<PortInput
						player={player}
						portsInput={portsInput}
						setPortsInput={setPortsInput}
						key={player.startggParticipantId}
					/>
				))}
			</DialogContent>
			<DialogActions>
				<Button
					loading={startSetMutation.isPending || updatePortsMutation.isPending}
					onClick={() => {
						updatePortsMutation.mutate(undefined, {
							onSuccess: () => {
								if (currentSet.state === "active") {
									onClose();
								} else {
									startSetMutation.mutate(undefined, {
										onSuccess: () => onClose(),
									});
								}
							},
						});
					}}
					disabled={
						players.length !== portsInput.filter((port) => port !== null).length
					}
					startIcon={<Sync />}
					color="success"
				>
					{currentSet.state === "active" ? "update ports" : "START SET"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
