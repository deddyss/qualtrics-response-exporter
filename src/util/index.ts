import { ExportFailedSurvey, ProgressBar, Survey } from "@/types";
import chalk from "chalk";
import { SingleBar } from "cli-progress";
import app from "app-root-path";
import path from "path";
import fs from "fs";

export const settingDirectoryPath = path.join(app.path, "./setting");

export const prefix = chalk.bold("○");
export const suffix = chalk.bold.cyan("?");

export const message = {
	user: {
		load: "Loading user information",
		fail: "Cannot retrieve user information"
	},
	survey: {
		load: {
			all: "Retrieving all your surveys",
			active: "Retrieving your active surveys"
		},
		fail: "Cannot retrieve survey list"
	}
};

export const isNotEmpty = (array: Array<any>): boolean => array && array.length > 0;

export const sleep = (delay: number = 0): Promise<void> => {
	return new Promise((resolve) => {
		if (delay > 0) {
			setTimeout(() => {
				resolve();
			}, delay);
		}
		else {
			resolve();
		}
	});
};

export const sanitizeFileName = (fileName: string): string => {
	return fileName.replace(/[/\\?%*:|"<>]/g, "").replace(/\s{2,}/g, " ").trim();
};

export const createOutputDirWithDateTime = (): string => {
	const outputDirectoryPath = path.join(app.path, "./output");
	if (!fs.existsSync(outputDirectoryPath)) {
		fs.mkdirSync(outputDirectoryPath);
	}

	const now = new Date();
	const offset = now.getTimezoneOffset() * 60 * 1000;
	const localDate = new Date(now.getTime() - offset);
	const formatted = localDate.toISOString().slice(0, 16).replace(/:/g, ".").replace("T", " ");
	
	const result = path.join(outputDirectoryPath, formatted);
	if (!fs.existsSync(result)) {
		fs.mkdirSync(result);
	}

	return result;
};

export const findSurvey = (id: string, surveys: Survey[]): Survey | null => {
	let result: Survey | null = null;
	for (let index = 0; index < surveys.length; index += 1) {
		const survey = surveys[index];
		if (survey.id === id) {
			result = survey;
			break;
		}
	}
	return result;
};

export const random = (min: number, max: number): number => {
	const minRange = Math.ceil(min);
	const maxRange = Math.floor(max);
	return Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
};

export const createProgressBar = (): ProgressBar => {
	const progressBar = new SingleBar({
		format: `${chalk.bold("Progress:")} ${chalk.cyan("{bar}")} | ${chalk.bold.yellow("{percentage}%")} | ETA: {eta}s | {value}/{total}`,
		barsize: 60,
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',
		hideCursor: true,
		forceRedraw: true,
		stopOnComplete: true,
	});
	return progressBar;
};

export const printOutputDirectoryPath = (directory: string): void => {
	// print new line
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
