import { Close } from "@mui/icons-material";
import { Card, DialogContentText, Radio, Typography } from "@mui/material";
import type { Dispatch } from "react";
import type { PlayerInActiveStartGGSet, Ports } from "../../backend/state";

interface Props {
	player: typeof PlayerInActiveStartGGSet.infer;
	portsInput: typeof Ports.infer;
	setPortsInput: Dispatch<typeof Ports.infer>;
}

export const PortInput = ({ player, portsInput, setPortsInput }: Props) => (
	<Card elevation={4} variant="outlined" className="pb-3 pt-1">
		<div className="flex flex-col gap-2 items-center">
			<DialogContentText className="whitespace-nowrap" variant="h6">
				Port of {player.tag}
			</DialogContentText>
			<div
				className="flex flex-nowrap items-center py-1 px-10 rounded-tl-4xl border-4 border-gray-300"
				style={{
					// @ts-expect-error - corner-shape is new, React types don't know it yet
					cornerShape: "bevel",
				}}
			>
				{[1, 2, 3, 4, null].map((radioValue) => {
					const foundIndex = portsInput.indexOf(player.startggParticipantId);

					const checked =
						radioValue === null
							? foundIndex === -1
							: foundIndex === radioValue - 1;

					return (
						<div key={radioValue} className="flex flex-col">
							<Radio
								checked={checked}
								checkedIcon={radioValue === null ? <Close /> : undefined}
								icon={radioValue === null ? <Close /> : undefined}
								onChange={() => {
									const newPorts: typeof Ports.infer = [...portsInput];

									if (foundIndex !== -1) {
										newPorts[foundIndex] = null;
									}

									if (radioValue !== null) {
										newPorts[radioValue - 1] = player.startggParticipantId;
									}

									setPortsInput(newPorts);
								}}
								disabled={
									radioValue !== null &&
									!checked &&
									portsInput[radioValue - 1] !== null
								}
								sx={{
									"& .MuiSvgIcon-root": {
										fontSize: 50,
									},
								}}
							/>
							<div className="flex gap-0.5 justify-center">
								{Array.from({ length: radioValue ?? 0 }).map((_, index) => (
									// eslint-disable-next-line @eslint-react/no-array-index-key
									<span key={index} className="text-center">
										{"\u2022"}
									</span>
								))}
								{radioValue === null && (
									<Typography variant="body2">Unplug</Typography>
								)}
							</div>
						</div>
					);
				})}
				<div className="flex flex-col gap-4 *:w-30 *:h-6 *:bg-gray-200 *:rounded-t-lg ml-8">
					<div></div>
					<div></div>
				</div>
			</div>
		</div>
	</Card>
);
