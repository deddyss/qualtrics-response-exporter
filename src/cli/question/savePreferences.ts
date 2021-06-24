import { Question } from "inquirer";
import chalk from "chalk";
import { prefix, suffix } from "@/util";

const savePreferences = (name: string): Question => ({
	type: "confirm",
	name: "savePreferences",
	message: `Hi ${name}, would you like to ${chalk.bold.yellow("save")} your current ${chalk.bold.yellow("preferences")} (except for API token) so next time you don't have to start over`,
	default: true,
	prefix,
	suffix
});

export default savePreferences;
