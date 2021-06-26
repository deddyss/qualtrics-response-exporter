import { CheckboxChoiceOptions, CheckboxQuestionOptions } from "inquirer";
import Separator from "inquirer/lib/objects/separator";
import chalk from "chalk";
import { prefix } from "@/util";
import { Answer, Survey } from "@/types";

const setPrefixNumber = (choices: CheckboxChoiceOptions[]): void => {
	const padLength = choices.length.toString().length;
	choices.forEach((choice: CheckboxChoiceOptions, index: number) => {
		const number = ((index + 1) + "").padStart(padLength, "0");
		choice.name = `${number}. ${choice.name}`;
	});
};

const surveysToChoiceOptions = (surveys: Survey[], answer: Answer): CheckboxChoiceOptions[] => {
	let choices: any[] = [];
	surveys.forEach((survey: Survey) => {
		let checked = false;
		if (answer.lastSelectedSurveys && answer.lastSelectedSurveys.includes(survey.id)) {
			checked = true;
		}
		choices.push({
			name: survey.name,
			short: survey.id,
			value: survey.id,
			checked
		} as CheckboxChoiceOptions);
	});
	choices.sort((a: CheckboxChoiceOptions, b: CheckboxChoiceOptions) => {
		if (a.name && b.name) {
			return a.name.localeCompare(b.name);
		}
		return 0;
	});
	setPrefixNumber(choices);
	choices.push(new Separator("─".repeat(80)));
	return choices;
};

const message = (surveys: Survey[], answer: Answer): string => {
	return `You have ${chalk.bold.yellow(surveys.length)} ${answer.activeSurveyOnly ? "active surveys" : "surveys"}. ` 
		+ `Please ${chalk.bold.yellow("select")} the ${chalk.bold.yellow("survey")} you want to export below`
};

const selectSurveysQuestion = (surveys: Survey[], answer: Answer): CheckboxQuestionOptions<Answer> => ({
	type: "checkbox",
	name: "selectedSurveys",
	message: message(surveys, answer),
	choices: surveysToChoiceOptions(surveys, answer),
	suffix: chalk.bold.cyan("!"),
	validate: (input?: string[]) => {
		return input?.length === 0 ? "You must select at least one survey before continue" : true;
	},
	prefix
});

export default selectSurveysQuestion;
