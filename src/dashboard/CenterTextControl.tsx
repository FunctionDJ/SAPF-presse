import { TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { trpc } from "../trpc-client";

export function CenterTextControl({ value }: { value: string }) {
	const [input, setInput] = useState(value);
	const mutation = useMutation(trpc.dashboard.setCenterText.mutationOptions());

	const submit = useDebouncedCallback(
		(text: string) => mutation.mutate({ centerText: text }),
		500,
	);

	return (
		<TextField
			label="Overlay Center Text"
			size="small"
			value={input}
			onChange={(e) => {
				setInput(e.target.value);
				submit(e.target.value);
			}}
		/>
	);
}
