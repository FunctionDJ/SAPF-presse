import { MenuItem, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { characters } from "@slippi/slippi-js";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { OverrideEntrant } from "../../backend/state";
import { trpc } from "../trpc-client";

interface Props {
	entrant: typeof OverrideEntrant.infer;
	side: "left" | "right";
	stationNumber: number;
}

const playableCharacters = characters
	.getAllCharacters()
	.filter((character) => character.id <= 25);

const getStockIconSource = (
	characterId: number | null,
	colorId: number | null,
) => {
	if (characterId === null) {
		return null;
	}

	const characterInfo = playableCharacters.find(
		(character) => character.id === characterId,
	);

	if (characterInfo === undefined) {
		return null;
	}

	const selectedColor =
		colorId === null || colorId === 0
			? null
			: (characterInfo.colors[colorId] ?? null);

	return `/stock-icons/${characterInfo.shortName}${selectedColor === null ? "" : `_${selectedColor}`}.png`;
};

export const EntrantOverride = ({ entrant, side, stationNumber }: Props) => {
	const [localEntrant, setLocalEntrant] = useState(entrant);

	const { mutate } = useMutation(
		trpc.dashboard.setEntrantOverride.mutationOptions(),
	);

	const debounced = useDebouncedCallback(
		(entrantParameter: typeof OverrideEntrant.infer) =>
			mutate({
				entrantOverride: entrantParameter,
				side,
				stationNumber,
			}),
		500,
	);

	const update = (entrantParameter: typeof OverrideEntrant.infer) => {
		setLocalEntrant(entrantParameter);
		debounced(entrantParameter);
	};

	const selectedCharacter = playableCharacters.find(
		(character) => character.id === localEntrant.player1.character,
	);

	const costumeValue =
		selectedCharacter === undefined
			? ""
			: (localEntrant.player1.characterColor ?? 0);

	const stockIconSource = getStockIconSource(
		localEntrant.player1.character,
		localEntrant.player1.characterColor,
	);

	return (
		<div className="flex flex-wrap items-center gap-2">
			<TextField
				label="Entrant A Tag"
				size="small"
				value={localEntrant.player1.tag}
				onChange={(event) =>
					update({
						...localEntrant,
						player1: { ...localEntrant.player1, tag: event.target.value },
					})
				}
			/>
			<TextField
				label="A Score"
				size="small"
				type="number"
				className="w-24"
				value={localEntrant.score ?? ""}
				onChange={(event) =>
					update({
						...localEntrant,
						score:
							event.target.value === "" ? null : Number(event.target.value),
					})
				}
			/>
			<TextField
				select
				label="Character"
				size="small"
				className="w-56"
				value={localEntrant.player1.character ?? ""}
				onChange={(event) => {
					const characterId =
						event.target.value === "" ? null : Number(event.target.value);
					const nextCharacter = playableCharacters.find(
						(character) => character.id === characterId,
					);

					update({
						...localEntrant,
						player1: {
							...localEntrant.player1,
							character: characterId,
							characterColor:
								nextCharacter === undefined
									? null
									: (localEntrant.player1.characterColor ?? 0) <
										  nextCharacter.colors.length
										? (localEntrant.player1.characterColor ?? 0)
										: 0,
						},
					});
				}}
			>
				<MenuItem value="">None</MenuItem>
				{playableCharacters.map((character) => (
					<MenuItem key={character.id} value={character.id}>
						{character.name}
					</MenuItem>
				))}
			</TextField>
			<TextField
				select
				label="Costume"
				size="small"
				className="w-44"
				disabled={selectedCharacter === undefined}
				value={costumeValue}
				onChange={(event) =>
					update({
						...localEntrant,
						player1: {
							...localEntrant.player1,
							characterColor:
								event.target.value === "" ? null : Number(event.target.value),
						},
					})
				}
			>
				{(selectedCharacter?.colors ?? []).map((colorName, index) => (
					<MenuItem key={colorName} value={index}>
						{colorName}
					</MenuItem>
				))}
			</TextField>
			{stockIconSource !== null && (
				<div className="flex items-center gap-2">
					<img
						className="h-8 w-8"
						style={{ imageRendering: "pixelated" }}
						src={stockIconSource}
						alt={`${selectedCharacter?.name ?? "Character"} stock icon`}
					/>
				</div>
			)}
		</div>
	);
};
