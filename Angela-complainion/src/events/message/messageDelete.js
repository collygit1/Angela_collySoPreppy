const { Events } = require("discord.js");

const MAX_SNIPES = 5;

module.exports = {
    name: Events.MessageDelete,

    execute(message, client) {
        if (!message.guild || message.author?.bot) return;
        if (!client.snipes) return;

        const entry = {
            content:   message.content || null,
            author: {
                id:       message.author.id,
                username: message.author.username,
                tag:      message.author.tag,
                avatar:   message.author.displayAvatarURL({ dynamic: true }),
            },
            image:     message.attachments.first()?.proxyURL || null,
            timestamp: Date.now(),
        };

        const existing = client.snipes.get(message.channel.id) || [];
        existing.unshift(entry);
        if (existing.length > MAX_SNIPES) existing.pop();
        client.snipes.set(message.channel.id, existing);
    },
};
