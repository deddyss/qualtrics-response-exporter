import { Question } from "inquirer";
import chalk from "chalk";
import { prefix, suffix } from "@/util";

const apiToken: Question = {
	type: "input",
	name: "apiToken",
	message: `What is your ${chalk.bold.yellow("API token")}`,
	validate: (input?: string) => {
		if (input) {
			const trimmedInput = input.trim();
			if (trimmedInput.length === 40 && trimmedInput.match(/[^0-9a-fA-F]/gm)) {
				return true;
			}
			return "Invalid API token. It should be 40 digit length and contains alphanumeric character only";
		}
		return "You must provide API token before proceeding";
	},
	prefix,
	suffix
};

export default apiToken;
