import { AnimatePresence, motion } from "motion/react";
import type { Character } from "../../backend/state";
import { StockIcon } from "../shared-frontend/StockIcon";
import { CustomAutoTextSize } from "./CustomAutoTextSize";
import { Stroked } from "./Stroked";

export interface EntrantInScoreboard {
	tag: string;
	pronouns: string;
	score: number | null;
	characters: (typeof Character.infer)[];
}

interface Props {
	className?: string;
	align: "L" | "R";
	entrant: EntrantInScoreboard;
	uniqueKey: string;
}

export const PlayerRow = ({ uniqueKey, className, align, entrant }: Props) => {
	const alignClass =
		align === "L" ? "left-[1vw] right-0" : "left-0 right-[1vw]";
	const flexClass = align === "L" ? "flex-row-reverse" : "flex-row";
	const pronounsClass = align === "L" ? "left-0" : "right-0";

	return (
		<div
			className={`absolute h-1/2 ${alignClass} flex ${flexClass} gap-[0.5vw] text-[3vw] ${className} px-1 py-0.5 items-center`}
		>
			<div className="relative flex grow h-full py-0.5">
				<AnimatePresence mode="wait">
					<motion.div
						key={uniqueKey + "pronouns" + entrant.pronouns}
						className={`absolute z-10 -top-[1.5vw] ${pronounsClass} text-[1.4vw]`}
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, transition: { duration: 0.1 } }}
						transition={{
							duration: 0.4,
							type: "spring",
						}}
					>
						<Stroked stroke={0.6}>{entrant.pronouns}</Stroked>
					</motion.div>
				</AnimatePresence>
				<AnimatePresence mode="wait">
					<motion.div
						key={uniqueKey + "tag" + entrant.tag}
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, transition: { duration: 0.1 } }}
						transition={{
							duration: 0.4,
							type: "spring",
						}}
						className={`w-full flex ${align === "L" ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`flex-1 ${align === "L" ? "justify-start" : "justify-end"} flex`}
						>
							{/* wrapper just for AutoTextSize because otherwise it shows a warning: "AutoTextSize has 1 siblings. This may interfere with the algorithm." */}

							<CustomAutoTextSize className="absolute self-center">
								{entrant.tag}
							</CustomAutoTextSize>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
			<StockIcon
				uniqueKey={uniqueKey + "character1"}
				className="h-3/4"
				character={entrant.characters[0] ?? null}
			/>
			{entrant.characters.length > 1 && (
				<StockIcon
					uniqueKey={uniqueKey + "character2"}
					className="h-3/4"
					character={entrant.characters[1] ?? null}
				/>
			)}
			<div className="flex justify-center w-[2.3vw] text-[3vw]">
				<AnimatePresence mode="wait">
					<motion.div
						key={uniqueKey + "score" + String(entrant.score)}
						initial={{ rotate: -180 }}
						animate={{
							rotate: 0,
							transition: { ease: "easeOut", duration: 0.2 },
						}}
						exit={{
							rotate: 180,
							transition: { ease: "easeIn", duration: 0.2 },
						}}
						transition={{
							type: "spring",
						}}
					>
						<Stroked>{entrant.score}</Stroked>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
};
