import { ChoiceOptions, ListQuestionOptions } from "inquirer";
import chalk from "chalk";
import { prefix, suffix } from "@/util";
import { Answer } from "@/types";
import DATA_CENTERS from "@/reference/dataCenter";

const DEFAULT_DATA_CENTER = "syd1";

const referenceToChoiceOptions = (): ChoiceOptions[] => {
	return Object.keys(DATA_CENTERS).map(
		(value: string) => ({
			name: value.padEnd(4, " ") + " (" + (DATA_CENTERS as Record<string, string>)[value] + ")",
			value
		} as ChoiceOptions)
	);
};

const dataCenterQuestion: ListQuestionOptions<Answer> = {
	type: "list",
	name: "dataCenter",
	message: `What is your ${chalk.bold.yellow("data center ID")}`,
	default: DEFAULT_DATA_CENTER,
	choices: referenceToChoiceOptions(),
	prefix,
	suffix
};

export default dataCenterQuestion;
