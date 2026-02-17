import { createTheme } from "@mui/material";

export const mainThemeConfig = {
	typography: {
		fontSize: 20,
	},
	components: {
		MuiButton: {
			defaultProps: {
				variant: "contained",
				fullWidth: true,
			},
		},
		MuiDialogContentText: {
			styleOverrides: {
				root: {
					color: "black",
				},
			},
		},
	},
} as const;

export const mainTheme = createTheme(mainThemeConfig);
