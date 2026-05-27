const { Events } = require("discord.js");
const { checkNuke } = require("../../addons/automod/antiNuke");

module.exports = {
    name: Events.GuildAuditLogEntryCreate,

    async execute(entry, guild, client) {
        await checkNuke(entry, guild, client);
    },
};
