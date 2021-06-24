import inquirer from "inquirer";
import { greeting, info } from "@/cli/statement";
import { apiToken, dataCenter } from "@/cli/question";
import spinner from "@/cli/spinner";
import { message, sleep } from "@/util";
import Qualtrics from "@/qualtrics";
import { ApiError } from "@/types";
import savePreferences from "./cli/question/savePreferences";
import activeSurveyOnly from "./cli/question/activeSurveyOnly";

const main = async () => {
	console.clear();
	console.log(greeting);
	await sleep(1000);

	console.log(info);
	await sleep(2000);

	let answer = await inquirer.prompt([ apiToken, dataCenter ]);

	spinner.start(message.user.load);
	let whoAmIApi = new Qualtrics.WhoAmI({
		apiToken: answer.apiToken as string,
		dataCenter: answer.dataCenter as string
	});
	let user;
	try {
		user = await whoAmIApi.userInfo();
		spinner.stop();	
	}
	catch(error) {
		const apiError = error as ApiError;
		spinner.fail(
			`${message.user.fail} (${ apiError.message ? apiError.message : apiError.statusText })`
		);
		return;
	}

	answer = await inquirer.prompt(
		[
			savePreferences(user.firstName ? user.firstName as string : user.lastName as string),
			activeSurveyOnly
		],
		answer
	);

	spinner.start(answer.activeSurveyOnly === true ? message.survey.load.active : message.survey.load.all);
	const surveysApi = new Qualtrics.Surveys({
		apiToken: answer.apiToken as string,
		dataCenter: answer.dataCenter as string
	});
	let surveys;
	try {
		if (answer.activeSurveyOnly) {
			surveys = await surveysApi.listActiveSurvey();
		}
		else {
			surveys = await surveysApi.listAllSurvey();
		}
		spinner.stop();
		console.log("surveys", surveys);
	}
	catch(error) {
		const apiError = error as ApiError;
		spinner.fail(
			`${message.survey.fail} (${ apiError.message ? apiError.message : apiError.statusText })`
		);
		return;
	}

	console.log("answer", answer);
};

main();
