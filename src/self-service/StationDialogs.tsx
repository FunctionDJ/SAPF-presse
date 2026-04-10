import { Check, Close } from "@mui/icons-material";
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
		<Dialog
			open={hwDialogOpen}
			onClose={() => setHwDialogOpen(false)}
			fullWidth
			maxWidth="xs"
		>
			<DialogTitle>
				Starting set {entrantLabel(currentSet.entrantA)} vs.{" "}
				{entrantLabel(currentSet.entrantB)}
			</DialogTitle>
			<DialogContent>
				<DialogContentText color="black" fontWeight={900}>
					Did you complete handwarmers?
					<br />
					If not, cancel, and come back afterwards.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					size="large"
					fullWidth
					variant="contained"
					color="secondary"
					onClick={() => {
						setHwDialogOpen(false);
					}}
					startIcon={<Close />}
				>
					Cancel
				</Button>
				<Button
					size="large"
					fullWidth
					variant="contained"
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
			// [FUTURE] improve remote port update handling
			/**
			 * the key={} trick doesn't seem to work well here because it seems to keep the dialog open on submit because submit updates ports. that, or "open" is never set to false in that scenario when using key={}
			 *
			 * ideally you'd do something like show the user a notification that the ports were remotely changed and prompt them to accept or discard the remote update.
			 */
			currentSet={currentSet}
			open={portDialogOpen}
			setOpen={setPortDialogOpen}
			ports={ports}
			stationNumber={stationId}
		/>
	</>
);
