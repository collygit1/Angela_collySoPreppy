const { Events, EmbedBuilder } = require("discord.js");
const store = require("../../database/securityStore");
const { logSecurity } = require("../../utils/securityActions");

module.exports = {
    name: Events.MessageUpdate,

    async execute(oldMsg, newMsg, client) {
        if (!newMsg.guild || newMsg.author?.bot) return;
        if (oldMsg.content === newMsg.content) return;

        const cfg = store.guild(newMsg.guild.id);
        if (!cfg.logChannel) return;

        const embed = new EmbedBuilder()
            .setColor("#747DFF")
            .setTitle("✏️ Message Edited")
            .setDescription(
                `**Author:** ${newMsg.author?.tag} (<@${newMsg.author?.id}>)\n` +
                `**Channel:** <#${newMsg.channel.id}>\n` +
                `[Jump to message](${newMsg.url})`
            )
            .addFields(
                { name: "Before", value: (oldMsg.content || "*unavailable*").substring(0, 400) },
                { name: "After",  value: (newMsg.content  || "*empty*").substring(0, 400) }
            )
            .setTimestamp();

        await logSecurity(client, newMsg.guild.id, embed);
    },
};
