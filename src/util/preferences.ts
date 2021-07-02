import app from "app-root-path";
import path from "path";
import fs from "fs";
import { Answer, Preference } from "@/types";

const settingDirectoryPath = path.join(app.path, "./setting");
const filePreferencesPath = path.join(app.path, "./setting/preferences.json");

export const isPreferencesExist = (): boolean => {
	return fs.existsSync(filePreferencesPath);
} 

export const loadPreferences = (): Preference | null => {
	if (isPreferencesExist()) {
		try {
			const preferences: string = fs.readFileSync(filePreferencesPath, "utf-8");
			return JSON.parse(preferences) as Preference;
		}
		catch (error) {}
	}
	return null;
};

export const savePreferences = (answer: Answer): void => {
	const { dataCenter, activeSurveyOnly, selectedSurveys } = answer;
	const preferences: Preference = { dataCenter, activeSurveyOnly, lastSelectedSurveys: selectedSurveys };
	if (!fs.existsSync(settingDirectoryPath)) {
		fs.mkdirSync(settingDirectoryPath);
	}
	fs.writeFileSync(filePreferencesPath, JSON.stringify(preferences));
};

export const deletePreferences = (): void => {
	if (isPreferencesExist()) {
		fs.rmSync(filePreferencesPath);
	}
}