import { Question } from "inquirer";
import chalk from "chalk";
import { prefix, suffix } from "@/util";
import { Answer } from "@/types";

const compressExportFileQuestion: Question<Answer> = {
	type: "confirm",
	name: "compressExportFile",
	message: `Do you want to ${chalk.bold.yellow("compress")} the export file as a ZIP file`,
	default: true,
	prefix,
	suffix
};

export default compressExportFileQuestion;
