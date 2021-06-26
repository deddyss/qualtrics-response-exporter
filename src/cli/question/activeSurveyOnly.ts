import { Question } from "inquirer";
import chalk from "chalk";
import { prefix, suffix } from "@/util";
import { Answer } from "@/types";

const activeSurveyOnlyQuestion: Question<Answer> = {
	type: "confirm",
	name: "activeSurveyOnly",
	message: `Do you want to export ${chalk.bold.yellow("only")} your ${chalk.bold.yellow("active surveys")} and exclude the non active ones`,
	default: true,
	when: (answer: Answer): boolean => answer.activeSurveyOnly === undefined,
	prefix,
	suffix
};

export default activeSurveyOnlyQuestion;
