import os from "os";
import Denque from "denque";
import inquirer, { QuestionCollection } from "inquirer";
import { spawn, Pool, Worker, FunctionThread } from "threads";
import { Logger } from "pino";
import { Surveys, WhoAmI } from "@/qualtrics";
import { greeting, info } from "@/cli/statement";
import {
	apiTokenQuestion, dataCenterQuestion, savePreferencesQuestion,
	activeSurveyOnlyQuestion, selectSurveysQuestion, loadPreferencesQuestion,
	exportFormatQuestion, exportWithContinuationQuestion, compressExportFileQuestion 
} from "@/cli/question";
import spinner from "@/cli/spinner";
import { createApiServer, getAvailablePort } from "@/api/server";
import { sleep, isNotEmpty, safeCurrentDateTimePathName, createOutputDirectory, createLogger, createLogFile } from "@/util";
import { isPreferencesExist, loadPreferences, savePreferences, deletePreferences, showPreferences } from "@/util/setting";
import { Answer, ApiError, PoolOptions, Runnable, RunnableOptions, Survey, User } from "@/types";
import { INFORMATION } from "@/reference";

// @ts-ignore
import workerUrl from "threads-plugin/dist/loader?name=app!./worker.ts";

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

const loadUserInformationFromQualtrics = (answer: Answer): Promise<User> => {
	return new Promise(async (resolve, reject) => {
		spinner.start(INFORMATION.USER.LOAD);

		let whoAmIApi = new WhoAmI({
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
				`${INFORMATION.USER.FAIL} (${ apiError.message ? apiError.message : apiError.statusText })`
			);
			reject();
		}
	});
};

const retrieveSurveyListFromQualtrics = (answer: Answer): Promise<Survey[]> => {
	return new Promise(async (resolve, reject) => {
		spinner.start(answer.activeSurveyOnly === true ?
			INFORMATION.SURVEY.LOAD.ACTIVE : INFORMATION.SURVEY.LOAD.ALL
		);
		const surveysApi = new Surveys({
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
				`${INFORMATION.SURVEY.FAIL} (${ apiError.message ? apiError.message : apiError.statusText })`
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
	[...Array(os.cpus().length).keys()].forEach((index: number) => {
		// queue the worker
		pool.queue(run => run({ ...options, ...{ id: index + 1 + "" }}));
	});
	return pool;
};

const waitUntilAllWorkerCompleted = async (
	pool: Pool<FunctionThread<[param: RunnableOptions], void>>
) => {
		// wait until all worker completed
		await pool.completed();
		await pool.terminate();
};

const main = async () => {
	let answer: Answer, user: User, surveys: Survey[];

	// initiate log
	const uniquePathName: string = safeCurrentDateTimePathName();
	const logFilePath: string = createLogFile(uniquePathName);
	const log: Logger = createLogger(logFilePath);

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
		log.info("dataCenter: %s", answer.dataCenter)

		user = await loadUserInformationFromQualtrics(answer);
		log.info("user: %s %s (brand: %s)", user.firstName, user.lastName, user.brandId);

		// ask if user wants to save preferences and / or retrieve only action surveys
		answer = await ask([
				savePreferencesQuestion(
					user.firstName ? user.firstName as string : user.lastName as string, user.brandId
				),
				activeSurveyOnlyQuestion
			],
			answer
		);
		log.info("activeSurveyOnly: %s", answer.activeSurveyOnly);

		surveys = await retrieveSurveyListFromQualtrics(answer);
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
		log.info("exportFormat: %s", answer.exportFormat);
		log.info("exportWithContinuation: %s", answer.exportWithContinuation);
		log.info("compressExportFile: %s", answer.compressExportFile);

		handlePreferences(answer);

		// initiate and fill queue
		const queue = new Denque<string>(answer.selectedSurveys as string[]);

		const exportFileDirectory = createOutputDirectory(uniquePathName);
		const internalApiServer = createApiServer(queue, surveys, exportFileDirectory, log);

		// start internal api server
		const internalApiPort = await getAvailablePort();
		await internalApiServer.listen(internalApiPort);

		const workerPool = createPoolAndEnqueueWorker({
			internalApiPort,
			exportFileDirectory,
			logFilePath,
			apiToken: answer.apiToken as string,
			dataCenter: answer.dataCenter as string,
			exportWithContinuation: answer.exportWithContinuation as boolean,
			exportFormat: answer.exportFormat as string,
			compressExportFile: answer.compressExportFile as boolean,
			surveys
		});

		await waitUntilAllWorkerCompleted(workerPool);
		await internalApiServer.close();
	}
	catch(error) {
		if (error) {
			console.error(error);
			log.error(error as any);
		}
	}
};

main();
