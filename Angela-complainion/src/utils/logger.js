const chalk = require("chalk");
const { emojis } = require("../config/settings");

const logger = {
    info:    (msg)       => console.log(`${chalk.cyan(emojis.info)} ${chalk.gray(msg)}`),
    success: (msg)       => console.log(`${chalk.green(emojis.success)} ${chalk.white(msg)}`),
    warn:    (msg)       => console.log(`${chalk.yellow(emojis.warn)} ${chalk.yellowBright(msg)}`),
    error:   (msg, err)  => console.error(`${chalk.red(emojis.error)} ${chalk.red(msg)}`, err || ""),
    system:  (msg)       => console.log(`${chalk.magenta(emojis.system)} ${chalk.magentaBright(msg)}`),
    debug:   (msg)       => { if (process.env.DEBUG) console.log(chalk.dim(`[debug] ${msg}`)); },
};

module.exports = logger;
