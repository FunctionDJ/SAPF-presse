// @ts-check

import eslint from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig(
	{ ignores: ["eslint.config.js"] },
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	reactPlugin.configs.flat.recommended,
	reactPlugin.configs.flat["jsx-runtime"],
	reactHooks.configs.flat.recommended,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
		rules: {
			"@typescript-eslint/strict-boolean-expressions": "error",
			"@typescript-eslint/consistent-return": "error",
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/default-param-last": "error",
			"@typescript-eslint/method-signature-style": "error",
			"@typescript-eslint/no-import-type-side-effects": "error",
			"@typescript-eslint/no-loop-func": "error",
			"@typescript-eslint/no-shadow": "error",
			// no-unsafe-type-assertion is really annoying when i know what i'm doing and any other solution would be stupid
			// "@typescript-eslint/no-unsafe-type-assertion": "error",
			"@typescript-eslint/prefer-destructuring": "error",
			"@typescript-eslint/prefer-ts-expect-error": "error",
			"@typescript-eslint/prefer-optional-chain": [
				"error",
				{
					// resolves conflict with @typescript-eslint/strict-boolean-expressions
					requireNullish: true,
				},
			],
			"@typescript-eslint/strict-void-return": "error",
			"@typescript-eslint/switch-exhaustiveness-check": "error",
			"@typescript-eslint/restrict-template-expressions": "off",
			"@typescript-eslint/no-confusing-void-expression": "off",
		},
	},
);
