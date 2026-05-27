const { REST, Routes, Events } = require("discord.js");
const fs     = require("node:fs");
const path   = require("node:path");
const logger = require("../utils/logger");

function walkDir(dir, callback) {
    for (const entry of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, entry);
        if (fs.statSync(fullPath).isDirectory()) walkDir(fullPath, callback);
        else if (entry.endsWith(".js")) callback(fullPath);
    }
}

function loadCommands(client) {
    const commandsPath = path.join(__dirname, "../commands");
    const addonsPath   = path.join(__dirname, "../addons");

    const slashData = [];

    const loadFrom = (dir) => {
        if (!fs.existsSync(dir)) return;
        walkDir(dir, (filePath) => {
            try {
                const cmd  = require(filePath);
                const name = cmd.data?.name || cmd.name;
                if (!name) return;

                client.commands.set(name, cmd);
                if (cmd.data) slashData.push(cmd.data.toJSON());
            } catch (err) {
                logger.error(`Failed to load command: ${filePath}`, err);
            }
        });
    };

    loadFrom(commandsPath);
    loadFrom(addonsPath);

    logger.info(`Commands loaded: ${client.commands.size}`);

    client.once(Events.ClientReady, async () => {
        try {
            const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
            await rest.put(Routes.applicationCommands(client.user.id), { body: slashData });
            logger.success(`Slash commands registered (${slashData.length} total).`);
        } catch (err) {
            logger.error("Failed to register slash commands:", err);
        }
    });
}

module.exports = { loadCommands };
