import { ProgressBar } from "@/types";
import chalk from "chalk";
import { SingleBar } from "cli-progress";
import app from "app-root-path";
import path from "path";

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
