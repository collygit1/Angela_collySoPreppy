const { Events } = require("discord.js");
const { checkAccountAge, checkRaid } = require("../../addons/automod/antiRaid");

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member, client) {
        if (!member.guild) return;
        await checkAccountAge(member, client);
        await checkRaid(member, client);
    },
};
