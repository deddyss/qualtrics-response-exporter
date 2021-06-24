import { Question } from "inquirer";
import chalk from "chalk";
import { prefix, suffix } from "@/util";

const activeSurveyOnly: Question = {
	type: "confirm",
	name: "activeSurveyOnly",
	message: `Do you want to export ${chalk.bold.yellow("only")} your ${chalk.bold.yellow("active surveys")} and exclude the non active ones`,
	default: true,
	prefix,
	suffix
};

export default activeSurveyOnly;
