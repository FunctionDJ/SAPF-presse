import { Check, Close } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TSet } from "../../shared/startgg-schemas";
import { trpc } from "../trpc-client";

interface Props {
	set: TSet;
	open: boolean;
	onClose: () => void;
	stationId: number;
}

export const ResetDialog = ({ set, open, onClose, stationId }: Props) => {
	const queryClient = useQueryClient();

	const resetSetMutation = useMutation({
		mutationFn: async () => {
			await fetch("https://api.start.gg/gql/alpha", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${import.meta.env.VITE_STARTGG_API_KEY}`,
				},
				body: JSON.stringify({
					query: `
						mutation resetset {
							resetSet(setId: ${set.id}) {
								id
							}
						}
					`,
				}),
			});

			await trpc.updatePorts.mutate({
				stationId,
				ports: [null, null, null, null],
			});
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["ports"] });
			await queryClient.invalidateQueries({ queryKey: ["stations"] });
		},
	});

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>
				Resetting set {set.slots[0].entrant.name} vs.{" "}
				{set.slots[1].entrant.name}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					This will reset the set score (!) and mark the set as
					&quot;ready&quot; (like resetting on start.gg).
				</DialogContentText>
			</DialogContent>
			<DialogContent>
				<DialogContentText>Are you sure you want to reset?</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					startIcon={<Close />}
					color="inherit"
					disabled={resetSetMutation.isPending}
					onClick={onClose}
				>
					cancel
				</Button>
				<Button
					startIcon={<Check />}
					loading={resetSetMutation.isPending}
					color="warning"
					onClick={() =>
						resetSetMutation.mutate(undefined, {
							onSuccess: onClose,
						})
					}
				>
					reset
				</Button>
			</DialogActions>
		</Dialog>
	);
};
