import { Question } from "inquirer";
import chalk from "chalk";
import { Answer } from "@/types";
import { prefix, suffix } from "./options";

const savePreferencesQuestion = (name: string, brand?: string): Question<Answer> => ({
	type: "confirm",
	name: "savePreferences",
	message: `Hi ${name}${ brand ? ` (${brand})` : "" }, would you like to ${chalk.bold.yellow("save")} your current ${chalk.bold.yellow("preferences")} (except for API token) so next time you don't have to start over`,
	default: true,
	prefix,
	suffix
});

export default savePreferencesQuestion;
