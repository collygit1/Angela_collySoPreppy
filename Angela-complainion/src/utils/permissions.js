const { PermissionFlagsBits } = require("discord.js");
const { bot } = require("../config/settings");

let store;
const getStore = () => {
    if (!store) store = require("../database/securityStore");
    return store;
};

// Returns true if the message author should bypass all security checks.
function isBypassed(message) {
    const { author, member, guild } = message;
    if (!guild) return true;
    if (author.id === bot.owner)                                                    return true;
    if (author.id === guild.ownerId)                                                return true;
    if (member?.permissions.has(PermissionFlagsBits.Administrator))                 return true;
    if (member?.permissions.has(PermissionFlagsBits.ManageMessages))                return true;
    if (getStore().isWhitelisted(guild.id, author.id))                              return true;
    return false;
}

// Returns true if an audit-log executor is trusted and should not be punished.
function isTrustedExecutor(executorId, guild, client) {
    if (executorId === client.user?.id)              return true;
    if (executorId === guild.ownerId)                return true;
    if (executorId === bot.owner)                    return true;
    if (getStore().isWhitelisted(guild.id, executorId)) return true;
    return false;
}

module.exports = { isBypassed, isTrustedExecutor };
