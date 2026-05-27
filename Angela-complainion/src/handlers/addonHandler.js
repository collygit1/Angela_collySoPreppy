const fs     = require("node:fs");
const path   = require("node:path");
const logger = require("../utils/logger");

const ADDONS_PATH = path.join(__dirname, "../addons");

function loadAddons(client) {
    if (!fs.existsSync(ADDONS_PATH)) return;

    const addons = fs.readdirSync(ADDONS_PATH).filter(name => {
        return fs.statSync(path.join(ADDONS_PATH, name)).isDirectory();
    });

    let loaded = 0;

    for (const addonName of addons) {
        const indexPath = path.join(ADDONS_PATH, addonName, "index.js");
        if (!fs.existsSync(indexPath)) continue;

        try {
            const addon = require(indexPath);
            if (typeof addon.load === "function") addon.load(client);
            loaded++;
            logger.info(`Addon loaded: ${addonName}`);
        } catch (err) {
            logger.error(`Failed to load addon: ${addonName}`, err);
        }
    }

    if (loaded > 0) logger.info(`Addons loaded: ${loaded}`);
}

module.exports = { loadAddons };
