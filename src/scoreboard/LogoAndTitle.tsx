import logo from "./assets/logo.png";

export const LogoAndTitle = () => (
	<div
		id="logo-and-title"
		className="absolute h-full w-full flex items-center justify-center z-10"
	>
		<img src={logo} alt="logo" className="w-8/10" />
	</div>
);
