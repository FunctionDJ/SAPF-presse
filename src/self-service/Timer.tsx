import { useEffect, useState } from "react";

interface Props {
	startDate: Date;
}

export const Timer = ({ startDate }: Props) => {
	const [elapsed, setElapsed] = useState("0:00");

	useEffect(() => {
		const updateElapsed = () => {
			const now = new Date();
			const diff = Math.floor((now.getTime() - startDate.getTime()) / 1000);
			const minutes = Math.floor(diff / 60);
			const seconds = diff % 60;
			setElapsed(`${minutes}:${seconds.toString().padStart(2, "0")}`);
		};

		updateElapsed();
		const interval = setInterval(updateElapsed, 1000);

		return () => clearInterval(interval);
	}, [startDate]);

	return <span>{elapsed}</span>;
};
