import { Check } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import type { CurrentSet, Ports } from "../../backend/state";
import { entrantLabel } from "../../shared/entrant-utilities";
import { PortsDialog } from "./PortsDialog";
import { ResetDialog } from "./ResetDialog";

interface Props {
	currentSet: typeof CurrentSet.infer;
	ports: typeof Ports.infer;
	hwDialogOpen: boolean;
	setHwDialogOpen: (open: boolean) => void;
	portDialogOpen: boolean;
	setPortDialogOpen: (open: boolean) => void;
	resetDialogOpen: boolean;
	setResetDialogOpen: (open: boolean) => void;
	stationId: number;
}

export const StationDialogs = ({
	currentSet,
	ports,
	hwDialogOpen,
	setHwDialogOpen,
	portDialogOpen,
	setPortDialogOpen,
	resetDialogOpen,
	setResetDialogOpen,
	stationId,
}: Props) => (
	<>
		<ResetDialog
			currentSet={currentSet}
			open={resetDialogOpen}
			onClose={() => setResetDialogOpen(false)}
			stationNumber={stationId}
		/>
		<Dialog open={hwDialogOpen} onClose={() => setHwDialogOpen(false)}>
			<DialogTitle>
				Starting set {entrantLabel(currentSet.entrantA)} vs.{" "}
				{entrantLabel(currentSet.entrantB)}
			</DialogTitle>
			<DialogContent>
				<DialogContentText color="black" fontWeight={900}>
					Did you complete handwarmers?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					startIcon={<Check />}
					onClick={() => {
						setHwDialogOpen(false);
						setPortDialogOpen(true);
					}}
				>
					Yes
				</Button>
			</DialogActions>
		</Dialog>
		<PortsDialog
			// use key={} to reset state when ports in global state update
			// this isn't perfect and might be disruptive, but should be a functional and easy solution for now.
			// when the Dialog is open, ideally you'd do something like show the user a notification that the ports were remotely changed and prompt them to accept or discard the remote update.
			key={JSON.stringify(ports)}
			currentSet={currentSet}
			open={portDialogOpen}
			setOpen={setPortDialogOpen}
			ports={ports}
			stationNumber={stationId}
		/>
	</>
);
