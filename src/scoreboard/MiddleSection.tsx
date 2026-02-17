import { ColoredSideBars } from "./ColoredSideBars";
import { LogoAndTitle } from "./LogoAndTitle";
import { PlayerBoxes } from "./PlayerBoxes";

export const MiddleSection = () => (
	<div
		id="middle-section"
		className="grow bg-linear-to-r from-yellow-200 via-yellow-100 to-yellow-200 relative"
	>
		<LogoAndTitle />
		<PlayerBoxes />
		<ColoredSideBars />
	</div>
);
