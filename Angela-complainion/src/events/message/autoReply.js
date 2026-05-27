const { Events } = require("discord.js");
const { getGuild, findMatch } = require("../../addons/autoreply/autoReplyStore");

module.exports = {
    name: Events.MessageCreate,

    async execute(message, client) {
        if (message.author.bot || !message.guild) return;
        if (!message.content?.trim())              return;

        const cfg = getGuild(message.guildId);
        if (!cfg.enabled) return;

        // Channel whitelist / blacklist
        if (cfg.whitelist?.length > 0 && !cfg.whitelist.includes(message.channelId)) return;
        if (cfg.blacklist?.length > 0 &&  cfg.blacklist.includes(message.channelId)) return;

        // Per-user cooldown
        const cdKey = `ar:${message.guildId}:${message.author.id}`;
        const now   = Date.now();
        if (client.autoReplyCooldowns?.has(cdKey)) {
            if (now - client.autoReplyCooldowns.get(cdKey) < (cfg.cooldown ?? 10000)) return;
        }

        const trigger = findMatch(message.guildId, message.content);
        if (!trigger) return;

        client.autoReplyCooldowns?.set(cdKey, now);

        await message.reply({ content: trigger.response }).catch(() => {});
    },
};
