import axios from "axios";
import { expose } from "threads";
import { Runnable, RunnableParam } from "@/types";
import { random, sleep } from "@/util";
import URL from "@/reference/route";

const getBaseUrl = (param: RunnableParam) => {
	return `http://localhost:${param.port}`;
}

const getSurveyId = (param: RunnableParam): Promise<string | null> => {
	return new Promise((resolve) => {
		axios.get<string>(URL.SURVEY, { baseURL: getBaseUrl(param) })
			.then((response) => {
				resolve(response.data);
			})
			.catch(() => {
				resolve(null);
			})
	});
};

const run: Runnable = async (param: RunnableParam) => {
	// console.log("start: %s", param.id);
	await sleep(random(1000, 5000));
	const surveyId = await getSurveyId(param);
	// console.log("surveyId: %s", surveyId);
	// await sleep(3000);
	// console.log("stop : %s", param.id);
};

expose(run);
