import inquirer from "inquirer";
import { greeting, info } from "@/cli/statement";
import { 
	apiTokenQuestion, dataCenterQuestion, savePreferencesQuestion, activeSurveyOnlyQuestion, selectSurveysQuestion, loadPreferencesQuestion 
} from "@/cli/question";
import spinner from "@/cli/spinner";
import { message, sleep, isNotEmpty } from "@/util";
import { isPreferencesExist, loadPreferences, savePreferences, deletePreferences } from "@/util/preferences";
import Qualtrics from "@/qualtrics";
import { Answer, ApiError, Survey, User } from "@/types";

const showGreetingAndInformation = async () => {
	console.clear();
	console.log(greeting);
	await sleep(1000);

	console.log(info);
	await sleep(2000);
};

const loadUserInformation = (answer: Answer): Promise<User> => {
	return new Promise(async (resolve, reject) => {
		spinner.start(message.user.load);

		let whoAmIApi = new Qualtrics.WhoAmI({
			apiToken: answer.apiToken as string,
			dataCenter: answer.dataCenter as string
		});

		try {
			const user: User = await whoAmIApi.userInfo();
			spinner.stop();
			resolve(user);
		}
		catch(error) {
			const apiError = error as ApiError;
			spinner.fail(
				`${message.user.fail} (${ apiError.message ? apiError.message : apiError.statusText })`
			);
			reject();
		}
	});
};

const retrieveSurveyList = (answer: Answer): Promise<Survey[]> => {
	return new Promise(async (resolve, reject) => {
		spinner.start(answer.activeSurveyOnly === true ? message.survey.load.active : message.survey.load.all);
		const surveysApi = new Qualtrics.Surveys({
			apiToken: answer.apiToken as string,
			dataCenter: answer.dataCenter as string
		});
		try {
			let surveys;
			if (answer.activeSurveyOnly) {
				surveys = await surveysApi.listActiveSurvey();
			}
			else {
				surveys = await surveysApi.listAllSurvey();
			}
			spinner.stop();
			resolve(surveys);
		}
		catch(error) {
			const apiError = error as ApiError;
			spinner.fail(
				`${message.survey.fail} (${ apiError.message ? apiError.message : apiError.statusText })`
			);
			return;
			reject();
		}
	});
};

const main = async () => {
	let answer: Answer, user: User, surveys: Survey[];

	// TODO:
	// initiate answer from saved preferences (if any)

	await showGreetingAndInformation();
	
	// ask api token and data center
	answer = await inquirer.prompt<Answer>([ apiTokenQuestion ]);

	if (isPreferencesExist()) {
		answer = await inquirer.prompt<Answer>([ loadPreferencesQuestion ], answer);
		if (answer.loadPreferences) {
			answer = { ...answer, ...loadPreferences(), ...{ savePreferences: true } };
		}
	}

	answer = await inquirer.prompt<Answer>([ dataCenterQuestion ], answer);

	try {
		user = await loadUserInformation(answer);
	}
	catch(error) {
		return;
	}

	// ask if user wants to save preferences and / or retrieve only action surveys
	answer = await inquirer.prompt<Answer>(
		[
			savePreferencesQuestion(user.firstName ? user.firstName as string : user.lastName as string),
			activeSurveyOnlyQuestion
		],
		answer
	);

	try {
		surveys = await retrieveSurveyList(answer);
	}
	catch(error) {
		return;
	}

	if (isNotEmpty(surveys)) {
		// ask user to select some surveys to export
		answer = await inquirer.prompt<Answer>([ selectSurveysQuestion(surveys, answer) ], answer);

		console.log(answer);
		
	}
	else {
		spinner.fail(`You don't have any ${ answer.activeSurveyOnly ? "active": "" } surveys`);
		return;
	}

	if (answer.savePreferences === true) {
		savePreferences(answer);
	}
	else {
		deletePreferences();
	}
};

main();
