import axios from "axios";
import path from "path";
import { expose } from "threads";
import { Logger } from "pino";
import { ResponseExport } from "@/qualtrics";
import { ExportFailedRequestBody, Runnable, RunnableOptions, StartExportRequestData } from "@/types";
import { createLogger, findSurvey, random, sanitizeFileName, sleep } from "@/util";
import { getContinuationToken, putContinuationToken } from "@/util/setting";
import { INTERNAL_API_URL } from "@/reference";

let log: Logger;
const initLog = (options: RunnableOptions): void => {
	log = createLogger(options.logFilePath);
};

const internalApiBaseUrl = (options: RunnableOptions) => {
	return `http://localhost:${options.internalApiPort}`;
}

const internalApiPutRequest = (url: string, options: RunnableOptions, data?: any) => {
	return axios.put(
		url,
		data, {
			baseURL: internalApiBaseUrl(options),
			headers: {
				"Content-Type": "application/json"
			}
		}
	);
};

const getSurveyIdFromInternalApi = async (options: RunnableOptions): Promise<string | null> => {
	return new Promise((resolve) => {
		axios.get<string>(INTERNAL_API_URL.SURVEY, { baseURL: internalApiBaseUrl(options) })
			.then((response) => {
				resolve(response.data);
			})
			.catch(() => {
				resolve(null);
			})
	});
};

const notifyInternalApiThatExportSuccess = async (options: RunnableOptions): Promise<void> => {
	return new Promise((resolve) => {
		internalApiPutRequest(INTERNAL_API_URL.EXPORT.SUCCESS, options, {})
			.then(() => {
				resolve();
			})
			.catch(() => {
				resolve();
			});
	});
}

const notifyInternalApiThatExportFailed = async (
	surveyId: string, errorMessage: string, options: RunnableOptions)
: Promise<void> => {
	const data: ExportFailedRequestBody = { surveyId, errorMessage };
	return new Promise((resolve) => {
		internalApiPutRequest(INTERNAL_API_URL.EXPORT.FAILED, options, data)
			.then(() => {
				resolve();
			})
			.catch(() => {
				resolve();
			});
	});
}

const startQualtricsResponseExport = async (
	api: ResponseExport, surveyId: string, options: RunnableOptions
) => {
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
	log.debug("(worker#%s) startExportResult[%s]: %o", options.id, surveyId, result);

	return result.progressId;
};

const getQualtricsResponseExportProgress = async (
	api: ResponseExport, surveyId: string, progressId: string, options: RunnableOptions
) => {
	const result = await api.getExportProgress(surveyId, progressId);
	log.debug("(worker#%s) exportProgressResult[%s]: %o", options.id, surveyId, result);

	return result;
};

const getQualtricsResponseExportFile = async (
	api: ResponseExport, surveyId: string, fileId: string, options: RunnableOptions
) => {
	const survey = findSurvey(surveyId, options.surveys);
	const fileName = (survey ? sanitizeFileName(survey.name) : surveyId)
		+ "." + options.exportFormat
		+ (options.compressExportFile ? ".zip" : "");
	const filePath = path.join(options.exportFileDirectory, fileName);
	log.debug("(worker#%s) exportFilePath[%s]: %s", options.id, surveyId, filePath);

	await api.getExportFile(surveyId, fileId, filePath);
};

const qualtricsResponseExportProcess = async (surveyId: string, options: RunnableOptions) => {
	const qualtricsApi = new ResponseExport(options);
	const progressId = await startQualtricsResponseExport(qualtricsApi, surveyId, options);
	let exportProgress;

	do {
		// wait
		await sleep(random(1000, 5000));
	
		exportProgress = await getQualtricsResponseExportProgress(qualtricsApi, surveyId, progressId, options);
	}
	// loop until completed or failed
	while (exportProgress.status === "inProgress");

	if (exportProgress.status === "complete") {
		const fileId = exportProgress.fileId as string;
		await getQualtricsResponseExportFile(qualtricsApi, surveyId, fileId, options);
		putContinuationToken(surveyId, exportProgress.continuationToken as string);
	}
	else {
		throw new Error("qualtrics has failed to export responses");
	}
};

const run: Runnable = async (options: RunnableOptions) => {
	initLog(options);

	let surveyId: string | null;
	while ((surveyId = await getSurveyIdFromInternalApi(options)) !== null) {
		try {
			await qualtricsResponseExportProcess(surveyId, options);
			await notifyInternalApiThatExportSuccess(options);
		}
		catch (err) {
			const error = err as Error;
			log.error("(worker#%s) [%s] %s", options.id, surveyId, error.message);
			await notifyInternalApiThatExportFailed(surveyId, error.message, options);
		}
		// wait
		await sleep(1000);
	}
};

expose(run);
