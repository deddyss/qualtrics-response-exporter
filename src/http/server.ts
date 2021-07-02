import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import AsyncLock from "async-lock";
import Denque from "denque";
import getPort from "get-port";
import URL from "@/reference/route";
import { createProgressBar } from "@/util";

const KEY = "QUEUE_SURVEY";
const lock = new AsyncLock({});
const progressBar = createProgressBar();

const getSurveyHandler = (queue: Denque<string>): RouteHandlerMethod => {
	const handler: RouteHandlerMethod = async (request, reply) => {
		const surveyId = await lock.acquire<string | null>(KEY, () => {
			if (queue.isEmpty()) {
				return null;
			}
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

export const createHttpServer = (queue: Denque<string>): FastifyInstance => {
	console.log();
	progressBar.start(queue.length, 0);

	const server = fastify({
		logger: false
	});

	server.route({
		method: "GET",
		url: URL.SURVEY,
		handler: getSurveyHandler(queue)
	});

	return server;
};

export const getAvailablePort = async (): Promise<number> => {
	return await getPort();
};
