import { ListQuestionOptions } from "inquirer";
import chalk from "chalk";
import { prefix } from "@/util";
import { Answer } from "@/types";

const exportFormatQuestion: ListQuestionOptions<Answer> = {
	type: "list",
	name: "exportFormat",
	message: `Please select the ${chalk.bold.yellow("format")} of the export file`,
	choices: ["csv", "tsv", "json", "ndjson", "spss", "xml"],
	prefix,
	suffix: chalk.bold.cyan("!"),
};

export default exportFormatQuestion;
