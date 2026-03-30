import { MiddleSection } from "./MiddleSection";

export function App() {
	return (
		<div className="flex h-full">
			<div
				id="left-stations"
				className="*:h-1/2 *:aspect-73/60 *:grid *:place-content-center"
			>
				<div>Station 1</div>
				<div>Station 3</div>
			</div>
			<MiddleSection />
			<div
				id="right-stations"
				className="*:h-1/2 *:aspect-73/60 *:grid *:place-content-center"
			>
				<div>Station 2</div>
				<div>Station 4</div>
			</div>
		</div>
	);
}
