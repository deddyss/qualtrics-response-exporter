import chalk from "chalk";

const info = `Please have your qualtrics ${chalk.bold.yellow("API token")} and `
 + `${chalk.bold.yellow("data center ID")} before proceeding. `
 + `You could read articles below to find out how, or ${chalk.bold.red("skip it")} if you already know:\n`
 + `- ${chalk.underline("https://www.qualtrics.com/support/integrations/api-integration/overview/#GeneratingAnAPIToken")}\n`
 + `- ${chalk.underline("https://www.qualtrics.com/support/integrations/api-integration/finding-qualtrics-ids/#LocatingtheDatacenterID")}\n`;

export default info;
