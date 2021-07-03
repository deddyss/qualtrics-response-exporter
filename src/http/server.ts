import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import AsyncLock from "async-lock";
import Denque from "denque";
import getPort from "get-port";
import URL from "@/reference/route";
import { createProgressBar } from "@/util";
import { ProgressBar, Survey } from "@/types";

const KEY = "QUEUE_SURVEY";
const lock = new AsyncLock({});
const progressBar: ProgressBar = createProgressBar();

const findSurvey = (id: string, surveys: Survey[]): Survey | null => {
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

const getSurveyHandler = (queue: Denque<string>): RouteHandlerMethod => {
	const handler: RouteHandlerMethod = async (request, reply) => {
		const surveyId = await lock.acquire<string | null>(KEY, () => {
			if (queue.isEmpty()) {
				return null;
			}
			// TODO:
			progressBar.increment();
			// in javascript, "shift" has the same meaning as the common term of "pop" or "remove first element" in a queue based on the FIFO (first in first out) principle
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

const startProgressBar = (total: number): void => {
	// print new line
	console.log();
	progressBar.start(total, 0);
};

export const createHttpServer = (queue: Denque<string>): FastifyInstance => {
	const server = fastify({
		logger: false
	});

	server.route({
		method: "GET",
		url: URL.SURVEY,
		handler: getSurveyHandler(queue)
	});

	startProgressBar(queue.length);
	return server;
};

export const getAvailablePort = async (): Promise<number> => {
	return await getPort();
};
