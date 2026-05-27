const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { lockdownGuild } = require("../../utils/securityActions");
const store = require("../../database/securityStore");
const { colors } = require("../../config/settings");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lockdown")
        .setDescription("Lock all text channels in the server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName("reason").setDescription("Reason for lockdown").setRequired(false)),

    name: "lockdown",
    aliases: ["lock"],

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        const cfg = store.guild(interaction.guild.id);
        if (cfg.lockdown) return interaction.editReply({ content: "⚠️ Server is already in lockdown." });

        const reason = interaction.options.getString("reason") || "Manual lockdown";
        await lockdownGuild(interaction.guild, client, reason);

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor("#FF4757")
                .setTitle("🔒 Lockdown Active")
                .setDescription(`All channels have been locked.\n**Reason:** ${reason}`)
                .setFooter({ text: `Initiated by ${interaction.user.tag}` })
                .setTimestamp()]
        });
    },

    async prefixExecute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild))
            return message.reply("❌ You need Manage Server permission.");
        const reason = args.join(" ") || "Manual lockdown";
        await lockdownGuild(message.guild, client, reason);
        await message.reply({ embeds: [new EmbedBuilder().setColor("#FF4757").setTitle("🔒 Lockdown Active").setDescription(`**Reason:** ${reason}`).setTimestamp()] });
    }
};
