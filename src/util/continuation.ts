import AsyncLock from "async-lock";
import path from "path";
import fs from "fs";
import { settingDirectoryPath } from "@/util";
import { Map } from "@/types";

const KEY = "CONTINUATION_TOKEN";
const lock = new AsyncLock({});

const continuationTokenMapFilePath = path.join(settingDirectoryPath, "./continuation.json");

const isContinuationTokenMapExist = (): boolean => {
	return fs.existsSync(continuationTokenMapFilePath);
} 

const loadContinuationTokenMap = (): Map<string> => {
	if (isContinuationTokenMapExist()) {
		try {
			const continuationTokenMap: string = fs.readFileSync(continuationTokenMapFilePath, "utf-8");
			return JSON.parse(continuationTokenMap) as Map<string>;
		}
		catch (error) {}
	}
	return {};
};

const saveContinuationTokenMap = (): void => {
	lock.acquire(KEY, () => {
		if (!fs.existsSync(settingDirectoryPath)) {
			fs.mkdirSync(settingDirectoryPath);
		}
		fs.writeFileSync(continuationTokenMapFilePath, JSON.stringify(continuationTokenMap));	
	});
};

const continuationTokenMap: Map<string> = loadContinuationTokenMap();

export const getContinuationToken = (surveyId: string): string | undefined => {
	return continuationTokenMap[surveyId];
};

export const putContinuationToken = (surveyId: string, continuationToken: string): void => {
	continuationTokenMap[surveyId] = continuationToken;
	saveContinuationTokenMap();
};
