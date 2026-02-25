import { useEffect, useState } from "react";
import { PlayerBox } from "./PlayerBox";
import type { PlayerState } from "./PlayerRow";

const players: [
	[PlayerState, PlayerState],
	[PlayerState, PlayerState],
	[PlayerState, PlayerState],
	[PlayerState, PlayerState],
] = [
	[
		{
			tag: "sprak",
			pronouns: "they/them",
			score: 0,
		},
		{
			tag: "sprak",
			pronouns: "they/them",
			score: 0,
		},
	],
	[
		{
			tag: "sprakkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
			pronouns: "they/them",
			score: 1,
		},
		{
			tag: "sprak",
			pronouns: "they/them",
			score: 0,
		},
	],

	[
		{
			tag: "sprak",
			pronouns: "they/them",
			score: 0,
		},
		{
			tag: "sprak",
			pronouns: "they/them",
			score: 0,
		},
	],
	[
		{
			tag: "sprakkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
			pronouns: "they/them",
			score: 1,
		},
		{
			tag: "sprak",
			pronouns: "they/them",
			score: 0,
		},
	],
];

export const PlayerBoxes = () => {
	const r = 200;
	const [name, setName] = useState("");

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
			<PlayerBox
				align="R"
				className="bg-pink-500 mt-[10%]"
				players={[
					{
						tag: name,
						pronouns: "they/them",
						score: 1,
					},
					{
						tag: "sprak",
						pronouns: "they/them",
						score: 0,
					},
				]}
			/>
			<PlayerBox
				align="L"
				className="bg-orange-500 mt-[40%]"
				players={players[1]}
			/>
			<PlayerBox
				align="L"
				className="bg-purple-500 mt-[150%]"
				players={players[2]}
			/>
			<PlayerBox
				align="R"
				className="bg-emerald-500 mt-[120%]"
				players={players[3]}
			/>
		</div>
	);
};
