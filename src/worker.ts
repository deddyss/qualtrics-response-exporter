import axios from "axios";
import { expose } from "threads";
import { ExportFailedRequestBody, Runnable, RunnableOptions, StartExportRequestData } from "@/types";
import URL from "@/reference/route";
import Qualtrics from "./qualtrics";
import ResponseExport from "./qualtrics/api/ResponseExport";
import { getContinuationToken, putContinuationToken } from "./util/continuation";
import { findSurvey, random, sanitizeFileName, sleep } from "./util";
import path from "path";

const getBaseUrl = (options: RunnableOptions) => {
	return `http://localhost:${options.port}`;
}

const getSurveyId = async (options: RunnableOptions): Promise<string | null> => {
	return new Promise((resolve) => {
		axios.get<string>(URL.SURVEY, { baseURL: getBaseUrl(options) })
			.then((response) => {
				resolve(response.data);
			})
			.catch(() => {
				resolve(null);
			})
	});
};

const putRequest = (url: string, options: RunnableOptions, data?: any) => {
	return axios.put(
		url,
		data, {
			baseURL: getBaseUrl(options),
			headers: {
				"Content-Type": "application/json"
			}
		}
	);
};

const putExportSuccess = async (options: RunnableOptions): Promise<void> => {
	return new Promise((resolve) => {
		putRequest(URL.EXPORT.SUCCESS, options, {})
			.then(() => {
				resolve();
			})
			.catch(() => {
				resolve();
			});
	});
}

const putExportFailed = async (surveyId: string, errorMessage: string, options: RunnableOptions): Promise<void> => {
	const data: ExportFailedRequestBody = { surveyId, errorMessage };
	return new Promise((resolve) => {
		putRequest(URL.EXPORT.FAILED, options, data)
			.then(() => {
				resolve();
			})
			.catch(() => {
				resolve();
			});
	});
}

const startExport = async (api: ResponseExport, surveyId: string, options: RunnableOptions) => {
	const data = {
		format: options.exportFormat,
		compress: options.compressExportFile
	} as StartExportRequestData;
	const continuationToken = getContinuationToken(surveyId);
	if (options.exportWithContinuation && continuationToken) {
		data.continuationToken = continuationToken;
	}
	else {
		data.allowContinuation = true;
	}

	const result = await api.startExport(surveyId, data);
	return result.progressId;
};

const getExportProgress = async (api: ResponseExport, surveyId: string, progressId: string) => {
	const result = await api.getExportProgress(surveyId, progressId);
	return result;
};

const getExportFile = async (
	api: ResponseExport, surveyId: string, fileId: string, options: RunnableOptions
) => {
	const survey = findSurvey(surveyId, options.surveys);
	const fileName = (survey ? sanitizeFileName(survey.name) : surveyId)
		+ "." + options.exportFormat
		+ (options.compressExportFile ? ".zip" : "");
	const filePath = path.join(options.directory, fileName);

	await api.getExportFile(surveyId, fileId, filePath);
};

const responseExport = async (surveyId: string, options: RunnableOptions) => {
	const api = new Qualtrics.ResponseExport(options);
	const progressId = await startExport(api, surveyId, options);
	let exportProgress;

	// loop until completed or failed
	do {
		// wait
		await sleep(random(2000, 6000));
	
		exportProgress = await getExportProgress(api, surveyId, progressId);
	}
	while (exportProgress.status === "inProgress");

	if (exportProgress.status === "complete") {
		const fileId = exportProgress.fileId as string;
		await getExportFile(api, surveyId, fileId, options);
		putContinuationToken(surveyId, exportProgress.continuationToken as string);
	}
	else {
		throw new Error("qualtrics has failed to export responses");
	}
};

const run: Runnable = async (options: RunnableOptions) => {
	let surveyId: string | null;
	while ((surveyId = await getSurveyId(options)) !== null) {
		try {
			await responseExport(surveyId, options);
			await putExportSuccess(options);
		}
		catch (err) {
			const error = err as Error;
			await putExportFailed(surveyId, error.message, options);
		}
		// wait
		await sleep(1000);
	}
};

expose(run);
