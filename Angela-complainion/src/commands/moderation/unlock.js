const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { unlockGuild } = require("../../utils/securityActions");
const store = require("../../database/securityStore");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Restore all channels after a lockdown.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    name: "unlock",

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        await unlockGuild(interaction.guild, client);

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor("#2ED573")
                .setTitle("🔓 Server Unlocked")
                .setDescription("All channels have been restored to normal.")
                .setFooter({ text: `Restored by ${interaction.user.tag}` })
                .setTimestamp()]
        });
    },

    async prefixExecute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild))
            return message.reply("❌ You need Manage Server permission.");
        await unlockGuild(message.guild, client);
        await message.reply({ embeds: [new EmbedBuilder().setColor("#2ED573").setTitle("🔓 Server Unlocked").setDescription("Channels restored.").setTimestamp()] });
    }
};
