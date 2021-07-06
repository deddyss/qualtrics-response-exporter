import chalk from "chalk";
import { ExportFailedSurvey } from "@/types";

export const printNewLine = (): void => {
	console.log();
}

export const printOutputDirectoryPath = (directory: string): void => {
	console.log(`\n${chalk.bold.green("✔")} Exported files are stored at ${directory}`);
};

export const printExportFailedSurveys = (exportFailedSurveys: ExportFailedSurvey[]): void => {
	if (exportFailedSurveys.length === 0) {
		return;
	}

	// sort by name
	exportFailedSurveys.sort((surveyPrev, surveyNext) => surveyPrev.name.localeCompare(surveyNext.name));

	console.log(`${chalk.bold.red("✖")} Response export failed for the following surveys:`);
	exportFailedSurveys.forEach((survey: ExportFailedSurvey, index: number) => {
		const number = index + 1;
		console.log(`  ${number}. ${survey.name} [id: ${survey.id}, ${chalk.red("error")}: ${survey.error}]`);
	})
};
