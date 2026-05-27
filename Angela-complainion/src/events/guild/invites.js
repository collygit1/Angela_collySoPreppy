const { Events } = require("discord.js");
const { bot } = require("../../config/settings");

module.exports = {
    name: Events.MessageCreate,

    async execute(message, client) {
        if (message.author.bot) return;
        if (!message.content.startsWith(bot.prefix)) return;

        const args       = message.content.slice(bot.prefix.length).trim().split(/ +/);
        const potentialId = args[0];

        // Only continue if the first argument looks like a Discord snowflake ID
        if (!/^\d{17,19}$/.test(potentialId)) return;

        try {
            const target = await client.users.fetch(potentialId);
            const link   = `https://discord.com/api/oauth2/authorize?client_id=${potentialId}&permissions=8&scope=bot%20applications.commands`;

            await message.reply({
                content: target.bot
                    ? `🤖 **Synthetic Entity Detected**\n**Name:** \`${target.username}\`\n**Link:** ${link}`
                    : `🔗 **Invite link generated for ID:**\n${link}`,
            });
        } catch {
            // If fetch fails, just generate the link anyway
            await message.reply({
                content: `🔗 **Invite link generated:**\nhttps://discord.com/api/oauth2/authorize?client_id=${potentialId}&permissions=8&scope=bot%20applications.commands`,
            });
        }
    },
};
