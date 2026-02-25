import { Stroked } from "./Stroked";

export interface PlayerState {
	tag: string;
	pronouns: string;
	score: number;
}

export const PlayerRow = ({
	className,
	align,
	player,
}: {
	className?: string;
	align: "L" | "R";
	player: PlayerState;
}) => {
	const f1 = Math.max(player.tag.length - 10, 0);
	const f2 = f1 * 0.2;
	const root = Math.max(Math.sqrt(f2), 0);

	const rootForStroke = Math.sqrt(f2);

	const alignClass = align === "L" ? "left-[1vw]" : "right-[1vw]";
	const flexClass = align === "L" ? "flex-row-reverse" : "flex-row";
	const pronounsClass = align === "L" ? "left-0" : "right-0";

	return (
		<div
			className={`absolute ${alignClass} flex ${flexClass} gap-[1vw] items-center text-[3vw] ${className}`}
		>
			{/* {player.score === 1 && (
				<div className="text-black text-xs fixed left-2/5 top-1/5 z-100 font-mono">
					<div>len {player.tag.length}</div>
					<div>f1 {f1}</div>
					<div>f2 {f2}</div>
					<div>log {log}</div>
				</div>
			)} */}
			<div className="relative">
				<Stroked
					className={`absolute z-10 -top-[1.8vw] ${pronounsClass} text-[1.4vw]`}
					stroke={0.6}
				>
					{player.pronouns}
				</Stroked>

				<div
					style={{
						fontSize: `calc(2.5vw - ${root}vw)`,
					}}
				>
					<Stroked stroke={0.8 - rootForStroke * 0.15}>{player.tag}</Stroked>
				</div>
			</div>
			<img
				className="w-[3vw] aspect-square"
				style={{ imageRendering: "pixelated" }}
				src="/stock-icons/Falcon.png"
			/>
			<div className="flex justify-center w-[2vw] text-[3vw]">
				<Stroked>{player.score}</Stroked>
			</div>
		</div>
	);
};
