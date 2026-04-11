import { autoTextSize } from "auto-text-size";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Stroked } from "./Stroked";

// taken from "auto-text-size" package, but modified to use it's size calculations for stroke thickness
export function CustomAutoTextSize({
	children,
	className,
}: {
	children: string;
	className?: string;
}) {
	const updateTextSizeRef = useRef<ReturnType<typeof autoTextSize>>(null);
	const [stroke, setStroke] = useState(0);

	const observer = useMemo(
		() =>
			new MutationObserver((mutationRecords) => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
				const target = mutationRecords[0]?.target as HTMLDivElement;
				const fontSizeAttrib = target.style.fontSize;
				setStroke(Number(fontSizeAttrib.replace("px", "")) * 0.1);
			}),
		[],
	);

	useEffect(() => {
		updateTextSizeRef.current?.();
	}, [children]);

	const refCallback = useCallback(
		(innerElement: HTMLElement | null) => {
			updateTextSizeRef.current?.disconnect();
			observer.disconnect();

			const containerElement = innerElement?.parentElement ?? null;

			if (innerElement === null || containerElement === null) {
				return;
			}

			observer.observe(innerElement, {
				attributeFilter: ["style"],
			});

			updateTextSizeRef.current = autoTextSize({
				innerEl: innerElement,
				containerEl: containerElement,
				mode: "oneline",
				minFontSizePx: 10,
				maxFontSizePx: 40,
			});
		},
		[observer],
	);

	return (
		<div ref={refCallback} className={className} id="test">
			<Stroked stroke={stroke / 6}>{children}</Stroked>
		</div>
	);
}
