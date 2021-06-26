import { Question } from "inquirer";
import chalk from "chalk";
import { prefix, suffix } from "@/util";
import { Answer } from "@/types";

const savePreferencesQuestion = (name: string): Question<Answer> => ({
	type: "confirm",
	name: "savePreferences",
	message: `Hi ${name}, would you like to ${chalk.bold.yellow("save")} your current ${chalk.bold.yellow("preferences")} (except for API token) so next time you don't have to start over`,
	default: true,
	when: (answer: Answer): boolean => answer.savePreferences === undefined,
	prefix,
	suffix
});

export default savePreferencesQuestion;
