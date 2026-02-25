import { Sync } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type Dispatch } from "react";
import type { SetType } from "../../shared/startgg-schemas";
import { trpc } from "../trpc-client";
import { PortInput } from "./PortInput";

interface Props {
	set: typeof SetType.infer;
	open: boolean;
	setOpen: Dispatch<boolean>;
	ports: (number | null)[];
	stationId: number;
}

export const PortsDialog = ({
	set,
	open,
	setOpen,
	ports,
	stationId,
}: Props) => {
	const participants = set.slots.flatMap((slot) => slot.entrant.participants);
	const queryClient = useQueryClient();
	const [portsInput, setPortsInput] = useState(ports);

	// TODO port resetting is not working properly

	// useEffect(() => {
	// 	setPortsInput(ports);
	// }, [ports]);

	const onClose = () => {
		setOpen(false);
		setPortsInput(ports);
	};

	const startSetMutation = useMutation({
		mutationFn: () =>
			fetch("https://api.start.gg/gql/alpha", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${import.meta.env.VITE_STARTGG_API_KEY}`,
				},
				body: JSON.stringify({
					query: `
						mutation startset {
							markSetInProgress(setId: ${set.id}) {
								id
							}
						}
					`,
				}),
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stations"] }),
	});

	const updatePortsMutation = useMutation({
		mutationFn: () => trpc.updatePorts.mutate({ stationId, ports: portsInput }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ports"] }),
	});

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>
				{set.state !== "active" ? "Starting set " : "Updating ports for "}
				{set.slots[0].entrant.name} vs. {set.slots[1].entrant.name}
			</DialogTitle>
			<DialogContent>
				{set.slots
					.flatMap((slot) => slot.entrant.participants)
					.map((participant) => (
						<PortInput
							participant={participant}
							portsInput={portsInput}
							setPortsInput={setPortsInput}
							key={participant.id}
						/>
					))}
			</DialogContent>
			<DialogActions>
				<Button
					loading={startSetMutation.isPending || updatePortsMutation.isPending}
					onClick={() => {
						updatePortsMutation.mutate(undefined, {
							onSuccess: () => {
								if (set.state !== "active") {
									startSetMutation.mutate(undefined, {
										onSuccess: () => onClose(),
									});
								} else {
									onClose();
								}
							},
						});
					}}
					disabled={
						participants.length !==
						portsInput.filter((port) => port !== null).length
					}
					startIcon={<Sync />}
					color="success"
				>
					{set.state === "active" ? "update ports" : "START SET"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
