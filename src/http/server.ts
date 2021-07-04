import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import AsyncLock from "async-lock";
import Denque from "denque";
import getPort from "get-port";
import URL from "@/reference/route";
import { createProgressBar, findSurvey, printExportFailedSurveys, printOutputDirectoryPath } from "@/util";
import { ExportFailedRequestBody, ExportFailedSurvey, ProgressBar, Survey } from "@/types";

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
			return queue.shift();
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
			exportFailedSurveys.push({
				id: data.surveyId,
				name: survey ? survey.name : data.surveyId,
				error: data.errorMessage
			});

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

const startProgressBar = (total: number): void => {
	// print new line
	console.log();
	progressBar.start(total, 0);
};

export const createHttpServer = (
	queue: Denque<string>, surveys: Survey[], directory: string
): FastifyInstance => {
	const server = fastify({
		logger: false
	});

	startProgressBar(queue.length);
	server.get(URL.SURVEY, getSurveyHandler(queue));
	server.put(URL.EXPORT.SUCCESS, putExportSuccessHandler(directory));
	server.put(URL.EXPORT.FAILED, putExportFailedHandler(surveys, directory));

	return server;
};

export const getAvailablePort = async (): Promise<number> => {
	return await getPort();
};
