import { twMerge } from "tailwind-merge";
import { PlayerRow, type PlayerState } from "./PlayerRow";

export const PlayerBox = ({
	className,
	align,
	players: [p1, p2],
}: {
	className: string;
	align: "L" | "R";
	players: [PlayerState, PlayerState];
}) => {
	const roundedClass = align === "L" ? "rounded-r-[2vw]" : "rounded-l-[2vw]";
	const alignClass = align === "L" ? "left-0" : "right-0";

	return (
		<div
			className={twMerge(
				`h-1/8 w-5/6 ${roundedClass} ${alignClass} absolute leading-[3vw]`,
				className,
			)}
		>
			<PlayerRow className="bottom-1/2" player={p1} align={align} />
			<PlayerRow className="bottom-0" player={p2} align={align} />
		</div>
	);
};
