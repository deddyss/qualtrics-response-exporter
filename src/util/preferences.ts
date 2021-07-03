import path from "path";
import fs from "fs";
import { Answer, Preferences } from "@/types";
import { settingDirectoryPath } from "@/util";
import chalk from "chalk";

const preferencesFilePath = path.join(settingDirectoryPath, "./preferences.json");

export const isPreferencesExist = (): boolean => {
	return fs.existsSync(preferencesFilePath);
}

export const loadPreferences = (): Preferences | null => {
	if (isPreferencesExist()) {
		try {
			const preferences: string = fs.readFileSync(preferencesFilePath, "utf-8");
			return JSON.parse(preferences) as Preferences;
		}
		catch (error) {}
	}
	return null;
};

export const showPreferences = (preferences: Preferences | null): void => {
	if (preferences) {
		const { lastSelectedSurveys, ...restPreferences } = preferences;
		console.log("  " +
			chalk.cyan(
				JSON.stringify(restPreferences)
					.replace("{", chalk.white("["))
					.replace("}", chalk.white("]"))
					.replace(/:true/, ":yes")
					.replace(/:false/, ":no")
					.replace(/,/g, chalk.white(", "))
					.replace(/:/g, chalk.white(": "))
			) + "\n"
		);
	}
};

export const savePreferences = (answer: Answer): void => {
	const { 
		dataCenter, activeSurveyOnly, selectedSurveys,
		exportFormat, exportWithContinuation, compressExportFile
	} = answer;
	const preferences: Preferences = { 
		dataCenter, activeSurveyOnly, lastSelectedSurveys: selectedSurveys, 
		exportFormat, exportWithContinuation, compressExportFile
	};
	if (!fs.existsSync(settingDirectoryPath)) {
		fs.mkdirSync(settingDirectoryPath);
	}
	fs.writeFileSync(preferencesFilePath, JSON.stringify(preferences));
};

export const deletePreferences = (): void => {
	if (isPreferencesExist()) {
		fs.rmSync(preferencesFilePath);
	}
}
