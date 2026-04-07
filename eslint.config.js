// @ts-check

import react from "@eslint-react/eslint-plugin";
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import typescript from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import deMorganBooleanLogic from "eslint-plugin-de-morgan";
import importX from "eslint-plugin-import-x";
import reactCompiler from "eslint-plugin-react-compiler";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig([
	{ ignores: ["eslint.config.js", "eslint-rules/*.js"] },
	eslint.configs.recommended,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	...tanstackQuery.configs["flat/recommended-strict"],
	typescript.configs.strictTypeChecked,
	typescript.configs.stylisticTypeChecked,
	unicorn.configs.recommended,
	reactCompiler.configs.recommended,
	reactRefresh.configs.vite,
	deMorganBooleanLogic.configs.recommended,
	react.configs["strict-type-checked"],
	{
		settings: {
			react: {
				version: "detect",
			},
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
		rules: {
			curly: "error",
			// allow null because i prefer explicit null and avoid undefined
			"unicorn/no-null": "off",
			"unicorn/prevent-abbreviations": [
				"error",
				// allow "Props" for react props interfaces
				{ allowList: { Props: true } },
			],
			"@typescript-eslint/strict-boolean-expressions": "error",
			"@typescript-eslint/consistent-return": "error",
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/default-param-last": "error",
			"@typescript-eslint/method-signature-style": "error",
			"@typescript-eslint/no-import-type-side-effects": "error",
			"@typescript-eslint/no-loop-func": "error",
			"@typescript-eslint/no-shadow": "error",
			"@typescript-eslint/no-unsafe-type-assertion": "error",
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
	// force PascalCase for .tsx
	{
		files: ["**/*.tsx"],
		rules: {
			// "unicorn/filename-case": ["error", { case: "pascalCase" }],
		},
	},
	{
		files: ["backend/**/*.ts"],
		rules: {
			"ban-console-without-prefix/ban-console-without-prefix": ["error"],
		},
		plugins: {
			"ban-console-without-prefix": {
				rules: {
					"ban-console-without-prefix": {
						meta: {
							type: "problem",
							docs: {
								description:
									"Disallow console calls unless first argument starts with `[` or `${logPrefix}`",
								recommended: false,
							},
							schema: [],
							messages: {
								banned: "Console call must start with `[` or `${logPrefix}`.",
							},
						},
						create: (context) => ({
							/**
							 * @param {import('estree').SimpleCallExpression} node
							 */
							CallExpression(node) {
								if (
									node.callee.type !== "MemberExpression" ||
									node.callee.object.type !== "Identifier" ||
									node.callee.object.name !== "console" ||
									node.callee.property.type !== "Identifier"
								) {
									return;
								}

								const method = node.callee.property.name;

								if (!Object.keys(console).includes(method)) {
									return;
								}

								const firstArg = node.arguments[0];

								if (
									!firstArg ||
									(firstArg.type !== "Literal" &&
										firstArg.type !== "TemplateLiteral")
								) {
									return;
								}

								if (firstArg.type === "Literal") {
									// is literal
									if (typeof firstArg.value !== "string") {
										context.report({ node, messageId: "banned" });
										return;
									}

									// is string literal
									if (firstArg.value.startsWith("[")) {
										return;
									}

									context.report({ node, messageId: "banned" });
								} else {
									// is template literal

									const firstExpression = firstArg.expressions[0];

									if (
										firstArg.quasis[0].value.raw.startsWith("[") ||
										(firstExpression.type === "Identifier" &&
											firstExpression.name === "logPrefix" &&
											firstArg.quasis[0].value.raw === "")
									) {
										return;
									}

									context.report({ node, messageId: "banned" });
								}
							},
						}),
					},
				},
			},
		},
	},
]);
