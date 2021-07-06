import { ProgressBar } from "@/types";
import chalk from "chalk";
import { SingleBar } from "cli-progress";

const createProgressBar = (): ProgressBar => {
	const progressBar = new SingleBar({
		format: `${chalk.bold("Progress:")} ${chalk.cyan("{bar}")} | ${chalk.bold.yellow("{percentage}%")} | ETA: {eta}s | {value}/{total}`,
		barsize: 60,
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',
		hideCursor: true,
		forceRedraw: true,
		stopOnComplete: true,
	});
	return progressBar;
};

export default createProgressBar;
