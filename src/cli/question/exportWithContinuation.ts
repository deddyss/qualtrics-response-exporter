import { ListQuestionOptions } from "inquirer";
import chalk from "chalk";
import { prefix } from "@/util";
import { Answer } from "@/types";

const exportWithContinuationQuestion: ListQuestionOptions<Answer> = {
	type: "list",
	name: "exportWithContinuation",
	message: `Do you want to export ${chalk.bold.yellow("with continuation")}${chalk.bold.cyan("?")} This gives you the ability to export new responses since the last export. The last response of the previous file export is the first response of the export with continuation.`,
	default: false,
	choices: [
		{
			name: "Yes, I want to export with continuation",
			short: "Export with continuation",
			value: true
		},
		{
			name: "No, export from the beginning please",
			short: "Export from the beginning",
			value: false
		}
	],
	when: (answer: Answer): boolean => answer.exportWithContinuation === undefined,
	prefix
};

export default exportWithContinuationQuestion;
