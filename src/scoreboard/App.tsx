import { MiddleSection } from "./MiddleSection";

export const App = () => (
	<div className="flex h-full">
		<div
			id="left-stations"
			className="*:h-1/2 *:aspect-73/60 *:grid *:place-content-center"
		>
			<div className="station-label">Station 1</div>
			<div className="station-label">Station 3</div>
		</div>
		<MiddleSection />
		<div
			id="right-stations"
			className="*:h-1/2 *:aspect-73/60 *:grid *:place-content-center"
		>
			<div className="station-label">Station 2</div>
			<div className="station-label">Station 4</div>
		</div>
	</div>
);
