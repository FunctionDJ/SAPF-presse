import { Check } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import type { SetType } from "../../shared/startgg-schemas";
import { PortsDialog } from "./PortsDialog";
import { ResetDialog } from "./ResetDialog";

interface Props {
	set: typeof SetType.infer;
	ports: (number | null)[];
	hwDialogOpen: boolean;
	setHwDialogOpen: (open: boolean) => void;
	portDialogOpen: boolean;
	setPortDialogOpen: (open: boolean) => void;
	resetDialogOpen: boolean;
	setResetDialogOpen: (open: boolean) => void;
	stationId: number;
}

export const StationDialogs = ({
	set,
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
			set={set}
			open={resetDialogOpen}
			onClose={() => setResetDialogOpen(false)}
			stationId={stationId}
		/>
		<Dialog open={hwDialogOpen} onClose={() => setHwDialogOpen(false)}>
			<DialogTitle>
				Starting set {set.slots[0].entrant.name} vs. {set.slots[1].entrant.name}
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
			set={set}
			open={portDialogOpen}
			setOpen={setPortDialogOpen}
			ports={ports}
			stationId={stationId}
		/>
	</>
);
