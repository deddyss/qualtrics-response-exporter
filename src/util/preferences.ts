import path from "path";
import fs from "fs";
import { Answer, Preference } from "@/types";
import { settingDirectoryPath } from "@/util";
import chalk from "chalk";

const preferencesFilePath = path.join(settingDirectoryPath, "./preferences.json");

export const isPreferencesExist = (): boolean => {
	return fs.existsSync(preferencesFilePath);
}

export const loadPreferences = (): Preference | null => {
	if (isPreferencesExist()) {
		try {
			const preferences: string = fs.readFileSync(preferencesFilePath, "utf-8");
			return JSON.parse(preferences) as Preference;
		}
		catch (error) {}
	}
	return null;
};

export const showPreferences = (preferences: Preference | null): void => {
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
	const { dataCenter, activeSurveyOnly, selectedSurveys, exportFormat, exportWithContinuation } = answer;
	const preferences: Preference = { 
		dataCenter, activeSurveyOnly, lastSelectedSurveys: selectedSurveys, 
		exportFormat, exportWithContinuation
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
