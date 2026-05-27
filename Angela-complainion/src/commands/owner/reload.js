const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadCommands } = require("../../handlers/commandHandler");

const OWNER_ID = process.env.OWNER_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("✦ [Owner] Hot-reload all commands without restarting"),

    async execute(interaction) {
        if (OWNER_ID && interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ This command is restricted to the bot owner.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const before = interaction.client.commands.size;
        const start  = Date.now();

        try {
            interaction.client.commands.clear();
            loadCommands(interaction.client);
            const after   = interaction.client.commands.size;
            const elapsed = Date.now() - start;

            await interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor("#4CAF50")
                    .setAuthor({ name: "angela ♡ | Owner Dashboard", iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("🔄 Commands Reloaded")
                    .addFields(
                        { name: "Before", value: String(before), inline: true },
                        { name: "After",  value: String(after),  inline: true },
                        { name: "Time",   value: `${elapsed}ms`, inline: true },
                    )
                    .setFooter({ text: "Note: slash command registration requires a restart · ˚ʚ♡ɞ˚ angela" })
                    .setTimestamp()
            ]});
        } catch (err) {
            console.error("[Reload]", err);
            await interaction.editReply({ content: `❌ Reload failed: \`${err.message}\`` });
        }
    },

    async prefixExecute(message) {
        if (OWNER_ID && message.author.id !== OWNER_ID) return;
        const before = message.client.commands.size;
        message.client.commands.clear();
        loadCommands(message.client);
        const after = message.client.commands.size;
        return message.reply(`🔄 Reloaded: **${before}** → **${after}** commands.`);
    },
};
