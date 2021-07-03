import AsyncLock from "async-lock";
import path from "path";
import fs from "fs";
import { settingDirectoryPath } from "@/util";
import { Map } from "@/types";

const KEY = "CONTINUATION_TOKEN";
const lock = new AsyncLock({});

const continuationTokenMapFilePath = path.join(settingDirectoryPath, "./continuation.json");

export const isContinuationTokenMapExist = (): boolean => {
	return fs.existsSync(continuationTokenMapFilePath);
} 

export const loadContinuationTokenMap = (): Map<string> => {
	if (isContinuationTokenMapExist()) {
		try {
			const continuationTokenMap: string = fs.readFileSync(continuationTokenMapFilePath, "utf-8");
			return JSON.parse(continuationTokenMap) as Map<string>;
		}
		catch (error) {}
	}
	return {};
};

export const saveContinuationTokenMap = (continuationTokenMap: Map<string>): void => {
	lock.acquire(KEY, () => {
		if (!fs.existsSync(settingDirectoryPath)) {
			fs.mkdirSync(settingDirectoryPath);
		}
		fs.writeFileSync(continuationTokenMapFilePath, JSON.stringify(continuationTokenMap));	
	});
};
