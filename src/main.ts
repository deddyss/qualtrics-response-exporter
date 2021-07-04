import inquirer, { QuestionCollection } from "inquirer";
import Denque from "denque";
import os from "os";
import { spawn, Pool, Worker, FunctionThread } from "threads";
import Qualtrics from "@/qualtrics";
import { greeting, info } from "@/cli/statement";
import { 
	apiTokenQuestion, dataCenterQuestion, savePreferencesQuestion,
	activeSurveyOnlyQuestion, selectSurveysQuestion, loadPreferencesQuestion,
	exportFormatQuestion, exportWithContinuationQuestion, compressExportFileQuestion 
} from "@/cli/question";
import spinner from "@/cli/spinner";
import { message, sleep, isNotEmpty, createOutputDirWithDateTime } from "@/util";
import {
	isPreferencesExist, loadPreferences, savePreferences, deletePreferences,
	showPreferences
} from "@/util/preferences";
import {
	Answer, ApiError, PoolOptions, Runnable, RunnableOptions, Survey, User
} from "@/types";
import { createHttpServer, getAvailablePort } from "@/http/server";
// @ts-ignore
import workerUrl from "threads-plugin/dist/loader?name=main!./worker.ts";

const showGreetingAndInformation = async () => {
	console.clear();
	console.log(greeting);
	await sleep(500);

	console.log(info);
	await sleep(500);
};

const ask = (questions: QuestionCollection, initialAnswer?: Answer): Promise<Answer> => {
	return inquirer.prompt<Answer>(questions, initialAnswer);
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
		spinner.start(answer.activeSurveyOnly === true ?
			message.survey.load.active : message.survey.load.all
		);
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
			reject();
		}
	});
};

const handlePreferences = (answer: Answer): void => {
	if (answer.savePreferences === true) {
		savePreferences(answer);
	}
	else {
		deletePreferences();
	}
};

const createPoolAndEnqueueWorker = (options: PoolOptions)
	:Pool<FunctionThread<[options: RunnableOptions], void>> => {
	// create worker
	const worker = new Worker(workerUrl);
	// create pool
	const pool = Pool(() => spawn<Runnable>(worker), os.cpus().length);
	// iterate as many as the number of cpu
	[...Array(os.cpus().length).keys()].forEach((key: number) => {
		// queue worker
		pool.queue(run => run({ ...options, ...{ id: key + 1 + "" }}));
	});
	return pool;
};

const waitUntilAllCompleted = async (
	pool: Pool<FunctionThread<[param: RunnableOptions], void>>
) => {
		// wait until all worker completed
		await pool.completed();
		await pool.terminate();
		process.kill(process.pid, "SIGTERM");
};

const main = async () => {
	let answer: Answer, user: User, surveys: Survey[];

	try {
		await showGreetingAndInformation();
		// ask api token
		answer = await ask([ apiTokenQuestion ]);

		if (isPreferencesExist()) {
			answer = await ask([ loadPreferencesQuestion ], answer);
			if (answer.loadPreferences) {
				// load preferences
				const preferences = loadPreferences();
				showPreferences(preferences);
				// merge answer
				answer = { ...answer, ...preferences, ...{ savePreferences: true } };
			}
		}
		// ask data center
		answer = await ask([ dataCenterQuestion ], answer);

		user = await loadUserInformation(answer);
		// ask if user wants to save preferences and / or retrieve only action surveys
		answer = await ask([
				savePreferencesQuestion(
					user.firstName ? user.firstName as string : user.lastName as string, user.brandId
				),
				activeSurveyOnlyQuestion
			],
			answer
		);

		surveys = await retrieveSurveyList(answer);
		if (isNotEmpty(surveys)) {
			// ask user to select some surveys to export
			answer = await ask([ selectSurveysQuestion(surveys, answer) ], answer);
		}
		else {
			spinner.fail(`You don't have any ${ answer.activeSurveyOnly ? "active": "" } surveys`);
			handlePreferences(answer);
			return;
		}

		// ask about export format, whether user wants to export with continuation
		// and compress the export file
		answer = await ask([
			exportFormatQuestion, exportWithContinuationQuestion, compressExportFileQuestion
		], answer);

		handlePreferences(answer);

		// initiate and fill queue
		const queue = new Denque<string>(answer.selectedSurveys as string[]);

		const port = await getAvailablePort();
		const directory = createOutputDirWithDateTime();
		const server = createHttpServer(queue, surveys, directory);
		// start internal web server
		await server.listen(port);

		const pool = createPoolAndEnqueueWorker({
			port,
			directory,
			apiToken: answer.apiToken as string,
			dataCenter: answer.dataCenter as string,
			exportWithContinuation: answer.exportWithContinuation as boolean,
			exportFormat: answer.exportFormat as string,
			compressExportFile: answer.compressExportFile as boolean,
			surveys
		});

		await waitUntilAllCompleted(pool);
	}
	catch(error) {
		console.error(error);
	}
};

main();
