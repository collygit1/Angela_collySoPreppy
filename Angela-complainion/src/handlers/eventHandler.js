const fs     = require("node:fs");
const path   = require("node:path");
const logger = require("../utils/logger");

function walkDir(dir, callback) {
    for (const entry of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, entry);
        if (fs.statSync(fullPath).isDirectory()) walkDir(fullPath, callback);
        else if (entry.endsWith(".js")) callback(fullPath, entry);
    }
}

function loadEvents(client) {
    const eventsPath = path.join(__dirname, "../events");
    if (!fs.existsSync(eventsPath)) return logger.warn("Events directory not found.");

    let count = 0;

    walkDir(eventsPath, (filePath, fileName) => {
        try {
            const event = require(filePath);
            if (!event.name) {
                logger.warn(`Event file ${fileName} is missing a name property — skipped.`);
                return;
            }

            const listener = (...args) => event.execute(...args, client);
            event.once ? client.once(event.name, listener) : client.on(event.name, listener);
            count++;
        } catch (err) {
            logger.error(`Failed to load event: ${fileName}`, err);
        }
    });

    logger.info(`Events loaded: ${count}`);
}

module.exports = { loadEvents };
