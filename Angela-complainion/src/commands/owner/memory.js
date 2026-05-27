const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const OWNER_ID = process.env.OWNER_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("memory")
        .setDescription("✦ [Owner] Manage Angela's AI conversation memory")
        .addSubcommand(sub => sub
            .setName("clear")
            .setDescription("Clear AI memory — all sessions or a specific user")
            .addUserOption(o => o
                .setName("user")
                .setDescription("Specific user to clear (leave blank to clear all)")))
        .addSubcommand(sub => sub
            .setName("stats")
            .setDescription("Show current AI memory usage")),

    async execute(interaction) {
        if (OWNER_ID && interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ This command is restricted to the bot owner.", ephemeral: true });
        }

        const sub    = interaction.options.getSubcommand();
        const client = interaction.client;

        if (sub === "stats") {
            const size = client.aiMemory?.size ?? 0;
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#ffcad4")
                    .setAuthor({ name: "angela ♡ | Memory Stats", iconURL: client.user.displayAvatarURL() })
                    .setTitle("🧠 AI Memory Usage")
                    .addFields(
                        { name: "Active Sessions", value: String(size), inline: true },
                        { name: "Memory per session", value: "Up to 10 messages", inline: true },
                    )
                    .setFooter({ text: "˚ʚ♡ɞ˚ memory · angela" })
                    .setTimestamp()
            ], ephemeral: true });
        }

        if (sub === "clear") {
            const target = interaction.options.getUser("user");

            if (target) {
                const had = client.aiMemory?.has(target.id);
                client.aiMemory?.delete(target.id);
                return interaction.reply({ embeds: [
                    new EmbedBuilder()
                        .setColor(had ? "#4CAF50" : "#FFA502")
                        .setAuthor({ name: "angela ♡ | Memory", iconURL: client.user.displayAvatarURL() })
                        .setTitle("🧹 Memory Cleared")
                        .setDescription(had
                            ? `Cleared AI memory for **${target.tag}**.`
                            : `**${target.tag}** had no active AI session.`)
                        .setFooter({ text: "˚ʚ♡ɞ˚ memory · angela" })
                        .setTimestamp()
                ], ephemeral: true });
            }

            const count = client.aiMemory?.size ?? 0;
            client.aiMemory?.clear();
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#4CAF50")
                    .setAuthor({ name: "angela ♡ | Memory", iconURL: client.user.displayAvatarURL() })
                    .setTitle("🧹 All Memory Cleared")
                    .setDescription(`Cleared **${count}** active AI session${count === 1 ? "" : "s"}.`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ memory · angela" })
                    .setTimestamp()
            ], ephemeral: true });
        }
    },

    async prefixExecute(message, args) {
        if (OWNER_ID && message.author.id !== OWNER_ID) return;
        const sub = args[0]?.toLowerCase();
        const client = message.client;

        if (sub === "stats") {
            return message.reply(`🧠 **AI Memory:** \`${client.aiMemory?.size ?? 0}\` active sessions.`);
        }
        if (sub === "clear") {
            const count = client.aiMemory?.size ?? 0;
            client.aiMemory?.clear();
            return message.reply(`🧹 Cleared **${count}** AI session(s).`);
        }
        message.reply("Usage: `memory stats` or `memory clear`");
    },
};
