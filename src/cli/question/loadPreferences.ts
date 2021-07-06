import { Question } from "inquirer";
import chalk from "chalk";
import { Answer } from "@/types";
import { prefix, suffix } from "./options";

const loadPreferencesQuestion: Question<Answer> = {
	type: "confirm",
	name: "loadPreferences",
	message: `Do you want to ${chalk.bold.yellow("load preferences")} from your last session`,
	default: true,
	prefix,
	suffix
};

export default loadPreferencesQuestion;
