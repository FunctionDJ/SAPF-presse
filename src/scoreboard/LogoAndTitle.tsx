import logo from "./assets/logo.png";
import { motion, AnimatePresence } from "motion/react";

interface Props {
	centerText: string;
}

export const LogoAndTitle = ({ centerText }: Props) => (
	<div
		id="logo-and-title"
		className="absolute h-full w-full flex items-center justify-center"
	>
		<img src={logo} alt="logo" className="w-7/10 z-11" />
		<AnimatePresence mode="wait">
			{
				<motion.span
					key={centerText}
					initial={{ scale: 0 }}
					animate={centerText === "" ? {} : { scale: 1 }}
					exit={{ scale: 0 }}
					className="text-slate-50 absolute top-4/7 z-12 bg-slate-600 rounded-xl px-3 py-0.5 text-[1.5vw]"
				>
					{centerText}
				</motion.span>
			}
		</AnimatePresence>
	</div>
);
