const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { isDisabled, setEnabled, getRoles, setRole, removeRole } = require("../levelStore");
const Embeds = require("../../../utils/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("levelsetup")
        .setDescription("✦ [Mod] Configure the leveling system for this server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub => sub
            .setName("toggle")
            .setDescription("Enable or disable leveling for this server")
            .addStringOption(o => o
                .setName("action")
                .setDescription("on or off")
                .setRequired(true)
                .addChoices({ name: "on", value: "on" }, { name: "off", value: "off" })))
        .addSubcommand(sub => sub
            .setName("roleaward")
            .setDescription("Give a role when a member reaches a level")
            .addIntegerOption(o => o.setName("level").setDescription("Level to reward at").setRequired(true).setMinValue(1))
            .addRoleOption(o => o.setName("role").setDescription("Role to give").setRequired(true)))
        .addSubcommand(sub => sub
            .setName("roleremove")
            .setDescription("Remove a level role reward")
            .addIntegerOption(o => o.setName("level").setDescription("Level to remove reward from").setRequired(true).setMinValue(1)))
        .addSubcommand(sub => sub
            .setName("roles")
            .setDescription("List all level role rewards")),

    async execute(interaction) {
        const sub     = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (sub === "toggle") {
            const on = interaction.options.getString("action") === "on";
            setEnabled(guildId, on);
            return interaction.reply({ embeds: [
                on  ? Embeds.success("leveling is now **on** for this server! ✨", interaction.client)
                    : Embeds.warn("leveling is now **off** for this server.", interaction.client),
            ]});
        }

        if (sub === "roleaward") {
            const level = interaction.options.getInteger("level");
            const role  = interaction.options.getRole("role");
            setRole(guildId, level, role.id);
            return interaction.reply({ embeds: [
                Embeds.success(`members who reach **level ${level}** will get ${role}! ♡`, interaction.client),
            ]});
        }

        if (sub === "roleremove") {
            const level = interaction.options.getInteger("level");
            removeRole(guildId, level);
            return interaction.reply({ embeds: [
                Embeds.success(`removed role reward for **level ${level}**.`, interaction.client),
            ], ephemeral: true });
        }

        if (sub === "roles") {
            const roles   = getRoles(guildId);
            const entries = Object.entries(roles);
            const desc    = entries.length === 0
                ? "*no role rewards set yet. use `/levelsetup roleaward` to add one!*"
                : entries
                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                    .map(([lvl, rid]) => `Level **${lvl}** → <@&${rid}>`)
                    .join("\n");

            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#c9b1ff")
                    .setAuthor({ name: "angela ♡ | level roles", iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("✨ Level Role Rewards")
                    .setDescription(desc)
                    .setFooter({ text: `leveling ${isDisabled(guildId) ? "disabled" : "enabled"} · ˚ʚ♡ɞ˚ angela` })
                    .setTimestamp(),
            ], ephemeral: true });
        }
    },
};
