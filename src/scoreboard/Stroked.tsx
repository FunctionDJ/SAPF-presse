import { twMerge } from "tailwind-merge";

export const Stroked = ({
	children,
	className,
	stroke = 0.8,
}: {
	children: React.ReactNode;
	className?: string;
	stroke?: number;
}) => (
	<div className={twMerge("relative", className)}>
		<span
			style={{
				WebkitTextStroke: `${stroke}vw #222`,
			}}
		>
			{children}
		</span>
		<span className="absolute left-0">{children}</span>
	</div>
);
