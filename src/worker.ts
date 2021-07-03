import axios from "axios";
import { expose } from "threads";
import { Runnable, RunnableParam } from "@/types";
import URL from "@/reference/route";

const getBaseUrl = (param: RunnableParam) => {
	return `http://localhost:${param.port}`;
}

const getSurveyId = async (param: RunnableParam): Promise<string | null> => {
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
	let surveyId: string | null;
	while ((surveyId = await getSurveyId(param)) !== null) {
		// do something here
	}
};

expose(run);
