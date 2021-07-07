import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import AsyncLock from "async-lock";
import Denque from "denque";
import getPort from "get-port";
import { Logger } from "pino";
import { INTERNAL_API_URL } from "@/reference";
import { findSurvey } from "@/util";
import { ExportFailedRequestBody, ExportFailedSurvey, ProgressBar, Survey } from "@/types";
import { printExportFailedSurveys, printNewLine, printOutputDirectoryPath } from "./console";
import createProgressBar from "./progressBar";

const queueKey = "QUEUE_KEY";
const queueLock = new AsyncLock();

const exportKey = "EXPORT_KEY";
const exportLock = new AsyncLock();

const progressBar: ProgressBar = createProgressBar();
const exportFailedSurveys: ExportFailedSurvey[] = [];
let doneExportCounter: number = 0;

const getSurveyHandler = (queue: Denque<string>): RouteHandlerMethod => {
	const handler: RouteHandlerMethod = async (request, reply) => {
		const surveyId = await queueLock.acquire<string | null>(queueKey, () => {
			if (queue.isEmpty()) {
				return null;
			}
			// in javascript, "shift" has the same meaning as the common term of "pop"
			// or "remove first element" in a queue based on the FIFO (first in first out)
			// principle
			const surveyId = queue.shift();
			reply.log.debug("surveyId: %s", surveyId);

			return surveyId;
		});
		if (surveyId !== null) {
			return surveyId;
		}
		else {
			return reply.code(404).send();
		}
	};
	return handler;
};

const putExportSuccessHandler = (directory: string): RouteHandlerMethod => {
	const handler: RouteHandlerMethod = async (request, reply) => {
		await exportLock.acquire<void>(exportKey, () => {
			progressBar.increment();

			doneExportCounter += 1;
			if (doneExportCounter === progressBar.getTotal()) {
				progressBar.stop();
				printOutputDirectoryPath(directory);
				printExportFailedSurveys(exportFailedSurveys);
			}

			return reply.code(200).send("OK");
		});
	};
	return handler;
};

const putExportFailedHandler = (surveys: Survey[], directory: string): RouteHandlerMethod => {
	const handler: RouteHandlerMethod = async (request, reply) => {
		await exportLock.acquire<void>(exportKey, () => {
			const data = request.body as ExportFailedRequestBody;
			const survey = findSurvey(data.surveyId, surveys);
			const exportFailedSurvey = {
				id: data.surveyId,
				name: survey ? survey.name : data.surveyId,
				error: data.errorMessage
			} as ExportFailedSurvey;
			// log
			request.log.debug(exportFailedSurvey);
			// push to list of export-failed survey
			exportFailedSurveys.push(exportFailedSurvey);

			doneExportCounter += 1;
			if (doneExportCounter === progressBar.getTotal()) {
				progressBar.stop();
				printOutputDirectoryPath(directory);
				printExportFailedSurveys(exportFailedSurveys);
			}

			return reply.code(200).send("OK");
		});
	};
	return handler;
};

export const createApiServer = (
	queue: Denque<string>, surveys: Survey[], directory: string, log?: Logger
): FastifyInstance => {
	const server = fastify({
		logger: log ? log : false
	});

	printNewLine();
	progressBar.start(queue.length, 0);

	server.get(INTERNAL_API_URL.SURVEY, getSurveyHandler(queue));
	server.put(INTERNAL_API_URL.EXPORT.SUCCESS, putExportSuccessHandler(directory));
	server.put(INTERNAL_API_URL.EXPORT.FAILED, putExportFailedHandler(surveys, directory));

	return server;
};

export const getAvailablePort = async (): Promise<number> => {
	return await getPort();
};
