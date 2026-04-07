import type { CurrentSet, UpcomingSet } from "../../backend/state";

interface Props {
	set: typeof CurrentSet.infer | typeof UpcomingSet.infer;
}

export const Round = ({ set }: Props) => {
	if (set.phaseGroup.bracketType === "ROUND_ROBIN") {
		return <span>Pool {set.phaseGroup.displayIdentifier}</span>;
	}

	if (set.phaseGroup.bracketType === "DOUBLE_ELIMINATION") {
		return <span>{set.fullRoundText}</span>;
	}

	return (
		<span>
			[Unsupported Bracket Type {set.phaseGroup.bracketType}, fullRoundText{" "}
			{set.fullRoundText}]
		</span>
	);
};
