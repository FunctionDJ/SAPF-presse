// ESLint rule: ban-console-without-prefix
// Bans any console.[log/error/warn/etc.] call that doesn't start with `[` or `${logPrefix}`

/**
 * @type {import('eslint').Rule.RuleModule}
 */
export const banConsoleWithoutPrefixRule = {
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
	create(context) {
		return {
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
					(firstArg.type !== "Literal" && firstArg.type !== "TemplateLiteral")
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

					if (
						firstArg.quasis[0].value.raw.startsWith("[") ||
						(firstArg.expressions[0].name === "logPrefix" &&
							firstArg.quasis[0].value.raw === "")
					) {
						return;
					}

					context.report({ node, messageId: "banned" });
				}
			},
		};
	},
};
