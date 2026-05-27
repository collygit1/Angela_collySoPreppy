const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { resetUser, resetAll } = require("../levelStore");
const Embeds = require("../../../utils/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resetlevel")
        .setDescription("✦ [Mod] Reset leveling data for a user or the whole server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub => sub
            .setName("user")
            .setDescription("Reset a specific user's level")
            .addUserOption(o => o.setName("target").setDescription("User to reset").setRequired(true)))
        .addSubcommand(sub => sub
            .setName("all")
            .setDescription("Reset ALL leveling data for this server (cannot be undone)")),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === "user") {
            const target = interaction.options.getUser("target");
            resetUser(interaction.guildId, target.id);
            return interaction.reply({ embeds: [
                Embeds.success(`reset **${target.username}**'s level data.`, interaction.client),
            ], ephemeral: true });
        }

        if (sub === "all") {
            resetAll(interaction.guildId);
            return interaction.reply({ embeds: [
                Embeds.warn("reset **all** leveling data for this server.", interaction.client),
            ], ephemeral: true });
        }
    },

    async prefixExecute(message, args) {
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply({ embeds: [Embeds.error("you need **Manage Server** for this.", message.client)] });
        }
        const sub = args[0]?.toLowerCase();
        if (sub === "all") {
            resetAll(message.guildId);
            return message.reply({ embeds: [Embeds.warn("reset all level data for this server.", message.client)] });
        }
        const target = message.mentions.users.first();
        if (!target) return message.reply({ embeds: [Embeds.error("mention a user or use `resetlevel all`.", message.client)] });
        resetUser(message.guildId, target.id);
        return message.reply({ embeds: [Embeds.success(`reset **${target.username}**'s level data.`, message.client)] });
    },
};
