import { Question } from "inquirer";
import chalk from "chalk";
import { Answer } from "@/types";
import { prefix, suffix } from "./options";

const compressExportFileQuestion: Question<Answer> = {
	type: "confirm",
	name: "compressExportFile",
	message: `Do you want to ${chalk.bold.yellow("compress")} the export file as a ZIP file`,
	default: true,
	prefix,
	suffix
};

export default compressExportFileQuestion;
