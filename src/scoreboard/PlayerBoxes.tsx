import { PlayerRow } from "./PlayerRow";

export const PlayerBoxes = () => {
	// const r = 200;
	// const [name, setName] = useState("");

	// useEffect(() => {
	// 	let counter = 0;

	// 	const interval = setInterval(() => {
	// 		if (counter > 50) counter = 0;

	// 		setName("sprak" + "k".repeat(counter++));
	// 	}, r);

	// 	return () => clearInterval(interval);
	// }, [r]);

	return (
		<div id="player-boxes" className="absolute h-full w-full">
			<div className="bg-pink-500 h-1/6 w-5/6 rounded-l-[3vw] ml-auto mt-[10%] relative leading-[4vw]">
				<PlayerRow
					className="bottom-1/2"
					tag="noxxa"
					score={2}
					pronouns="test/ing"
				/>
				<PlayerRow
					className="bottom-0"
					tag="sprak"
					score={1}
					pronouns="test/ing"
				/>
			</div>
			<div className="bg-orange-500 h-1/6 w-5/6 rounded-r-[3vw] mr-auto mt-[10%] relative leading-[4vw]">
				<PlayerRow
					className="bottom-1/2"
					tag="noxxa"
					score={2}
					pronouns="test/ing"
				/>
				<PlayerRow
					className="bottom-0"
					tag="sprak"
					score={1}
					pronouns="test/ing"
				/>
			</div>
		</div>
	);
};
