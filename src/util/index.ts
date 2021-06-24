import chalk from "chalk";

export const prefix = chalk.bold("○");
export const suffix = chalk.bold.cyan("?");

export const message = {
	user: {
		load: "Loading user information",
		fail: "Cannot retrieve user information"
	},
	survey: {
		load: {
			all: "Retrieving all your surveys",
			active: "Retrieving your active surveys"
		},
		fail: "Cannot retrieve survey list"
	}
}

export const sleep = (delay: number = 0): Promise<void> => {
	return new Promise((resolve) => {
		if (delay > 0) {
			setTimeout(() => {
				resolve();
			}, delay);
		}
		else {
			resolve();
		}
	});
};
