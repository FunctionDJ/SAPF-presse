import type { State } from "../../backend/state";
import { PlayerBox } from "./PlayerBox";
import { scoreboardAccentColors } from "./colors";

interface Props {
	state: typeof State.infer;
}

export const PlayerBoxes = ({ state }: Props) => (
	<div id="player-boxes" className="absolute h-full w-full z-10">
		<PlayerBox
			uniqueKey="1"
			align="R"
			className="mt-[10%]"
			style={{ backgroundColor: scoreboardAccentColors.cherry }}
			station={state.stations[1]}
		/>
		<PlayerBox
			uniqueKey="2"
			align="L"
			className="mt-[40%]"
			style={{ backgroundColor: scoreboardAccentColors.orange }}
			station={state.stations[0]}
		/>
		<PlayerBox
			uniqueKey="3"
			align="L"
			className="mt-[150%]"
			style={{ backgroundColor: scoreboardAccentColors.grape }}
			station={state.stations[2]}
		/>
		<PlayerBox
			uniqueKey="4"
			align="R"
			className="mt-[120%]"
			style={{ backgroundColor: scoreboardAccentColors.apple }}
			station={state.stations[3]}
		/>
	</div>
);
