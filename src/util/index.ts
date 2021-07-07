import path from "path";
import fs from "fs";
import pino, { Logger } from "pino";
import { DIRECTORY } from "@/reference";
import { Survey } from "@/types";

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

export const sanitizeFileName = (fileName: string): string => {
	return fileName.replace(/[/\\?%*:|"<>]/g, "").replace(/\s{2,}/g, " ").trim();
};

export const safeCurrentDateTimePathName = (): string => {
	const now = new Date();
	const offset = now.getTimezoneOffset() * 60 * 1000;
	const localDate = new Date(now.getTime() - offset);
	const result = localDate.toISOString().slice(0, 19).replace(/:/g, ".").replace("T", " ");

	return result;
};

export const createOutputDirectory = (name: string): string => {
	const directoryPath = path.join(DIRECTORY.OUTPUT, name);
	if (!fs.existsSync(directoryPath)) {
		fs.mkdirSync(directoryPath, { recursive: true });
	}
	return directoryPath;
};

export const createLogFile = (name: string): string => {
	const filePath = path.join(DIRECTORY.LOG, name.endsWith(".log") ? name : name.concat(".log"));
	if (!fs.existsSync(DIRECTORY.LOG)) {
		fs.mkdirSync(DIRECTORY.LOG, { recursive: true });
	}
	if (!fs.existsSync(filePath)) {
		fs.closeSync(fs.openSync(filePath, "w"));
	}
	return filePath;
};

export const createLogger = (filePath: string): Logger => {
	const destination = pino.destination(filePath);
	const logger = pino(
		{
			prettyPrint: {
				colorize: false,
				translateTime: true
			},
			level: "debug",
			redact: ["*.apiToken"]
		},
		destination
	);
	return logger;
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
