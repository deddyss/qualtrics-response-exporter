import { Question } from "inquirer";
import chalk from "chalk";
import { prefix, suffix } from "@/util";
import { Answer } from "@/types";

const loadPreferencesQuestion: Question<Answer> = {
	type: "confirm",
	name: "loadPreferences",
	message: `Do you want to ${chalk.bold.yellow("load preferences")} from your last session`,
	default: true,
	prefix,
	suffix
};

export default loadPreferencesQuestion;
