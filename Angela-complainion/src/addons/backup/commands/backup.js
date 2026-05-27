const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { runBackup } = require("../backupManager");

const OWNER_ID = process.env.OWNER_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("backup")
        .setDescription("✦ [Owner] Manually trigger a full JSON database backup"),

    async execute(interaction) {
        if (OWNER_ID && interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ This command is restricted to the bot owner.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const start  = Date.now();
            const result = runBackup();
            const elapsed = Date.now() - start;

            await interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor("#4CAF50")
                    .setAuthor({ name: "angela ♡ | Backup System", iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("💾 Backup Complete")
                    .addFields(
                        { name: "📅 Date",       value: result.stamp,          inline: true },
                        { name: "📂 Files",       value: String(result.count),  inline: true },
                        { name: "⏱️ Time",        value: `${elapsed}ms`,        inline: true },
                        { name: "📁 Location",    value: `\`database/backups/${result.stamp}/\``, inline: false },
                    )
                    .setFooter({ text: "Auto-backups run daily · ˚ʚ♡ɞ˚ angela" })
                    .setTimestamp()
            ]});
        } catch (err) {
            console.error("[Backup Command]", err);
            await interaction.editReply({ content: `❌ Backup failed: \`${err.message}\`` });
        }
    },

    async prefixExecute(message) {
        if (OWNER_ID && message.author.id !== OWNER_ID) return;
        try {
            const result = runBackup();
            return message.reply(`💾 **Backup complete!** ${result.count} files → \`backups/${result.stamp}/\``);
        } catch (err) {
            return message.reply(`❌ Backup failed: \`${err.message}\``);
        }
    },
};
