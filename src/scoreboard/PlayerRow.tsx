import { Stroked } from "./Stroked";

export const PlayerRow = ({
	className,
	tag,
	score,
	pronouns,
}: {
	className?: string;
	score: number;
	tag: string;
	pronouns: string;
}) => {
	const f1 = Math.max(tag.length - 10, 0);
	const f2 = f1 * 0.2;
	const root = Math.max(Math.sqrt(f2), 0);

	const rootForStroke = Math.sqrt(f2);

	return (
		<div
			className={`absolute right-[1vw] flex gap-[1vw] items-center text-[3vw] ${className}`}
		>
			{/* {score === 1 && (
				<div className="text-black text-xs fixed left-2/5 top-1/5 z-100 font-mono">
					<div>len {tag.length}</div>
					<div>f1 {f1}</div>
					<div>f2 {f2}</div>
					<div>log {log}</div>
				</div>
			)} */}
			<div className="relative">
				<Stroked className="absolute z-10 -top-[2vw] right-0 text-[1.5vw]">
					{pronouns}
				</Stroked>

				<div
					style={{
						fontSize: `calc(3vw - ${root}vw)`,
					}}
				>
					<Stroked stroke={0.8 - rootForStroke * 0.15}>{tag}</Stroked>
				</div>
			</div>
			<img
				className="w-[3vw] aspect-square"
				style={{ imageRendering: "pixelated" }}
				src="/stock-icons/Falcon.png"
			/>
			<div className="flex justify-center w-[2vw] text-[4vw]">
				<Stroked>{score}</Stroked>
			</div>
		</div>
	);
};
