import { Question } from "inquirer";
import chalk from "chalk";
import { Answer } from "@/types";
import { prefix, suffix } from "./options";

const activeSurveyOnlyQuestion: Question<Answer> = {
	type: "confirm",
	name: "activeSurveyOnly",
	message: `Do you want to export ${chalk.bold.yellow("only")} your ${chalk.bold.yellow("active surveys")} and exclude the non active ones`,
	default: true,
	prefix,
	suffix
};

export default activeSurveyOnlyQuestion;
