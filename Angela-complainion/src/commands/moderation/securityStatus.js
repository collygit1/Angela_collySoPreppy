const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const store = require("../../database/securityStore");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("security-status")
        .setDescription("View or configure security settings.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(s => s.setName("view").setDescription("View the current security status"))
        .addSubcommand(s => s.setName("setlog")
            .setDescription("Set the security log channel")
            .addChannelOption(o => o.setName("channel").setDescription("Log channel").setRequired(true)
                .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(s => s.setName("accountage")
            .setDescription("Set minimum account age requirement (0 = disabled)")
            .addIntegerOption(o => o.setName("days").setDescription("Minimum account age in days").setRequired(true).setMinValue(0).setMaxValue(365))),

    name: "security-status",
    aliases: ["secsettings", "secstatus"],

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const gid = interaction.guild.id;

        if (sub === "view") {
            const cfg = store.guild(gid);
            const { antiNuke, antiRaid, antiSpam } = cfg.config;

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor("#2b1422")
                    .setTitle("angela ♡ | Security Status")
                    .addFields(
                        { name: "🔒 Lockdown",     value: cfg.lockdown ? "🔴 Active"   : "🟢 Inactive",  inline: true },
                        { name: "📋 Log Channel",  value: cfg.logChannel ? `<#${cfg.logChannel}>` : "Not set", inline: true },
                        { name: "👤 Account Age",  value: cfg.accountAgeMin ? `${cfg.accountAgeMin}d min` : "Disabled", inline: true },
                        { name: "🛡️ Anti-Nuke",   value: antiNuke.enabled  ? `✅ ${antiNuke.threshold} acts/${antiNuke.window/1000}s`  : "❌ Off", inline: true },
                        { name: "⚡ Anti-Raid",    value: antiRaid.enabled  ? `✅ ${antiRaid.threshold} joins/${antiRaid.window/1000}s` : "❌ Off", inline: true },
                        { name: "🔇 Anti-Spam",    value: antiSpam.enabled  ? `✅ ${antiSpam.msgThreshold} msgs/${antiSpam.window/1000}s` : "❌ Off", inline: true },
                        { name: "✅ Whitelist",    value: `${cfg.whitelist.length} users`, inline: true },
                        { name: "🚫 Blacklist",    value: `${cfg.blacklist.length} users`, inline: true },
                        { name: "⚠️ Total Warned", value: `${Object.keys(cfg.warnings).length} users`, inline: true },
                    )
                    .setFooter({ text: "angela · Security System" })
                    .setTimestamp()],
                ephemeral: true
            });
        }

        if (sub === "setlog") {
            const ch = interaction.options.getChannel("channel");
            store.setLogChannel(gid, ch.id);
            return interaction.reply({ content: `✅ Security logs will be sent to <#${ch.id}>.`, ephemeral: true });
        }

        if (sub === "accountage") {
            const days = interaction.options.getInteger("days");
            store.setAccountAge(gid, days);
            const msg = days === 0 ? "Account age requirement **disabled**." : `Account age requirement set to **${days} day(s)**.`;
            return interaction.reply({ content: `✅ ${msg}`, ephemeral: true });
        }
    },

    async prefixExecute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild))
            return message.reply("❌ Manage Server permission required.");

        const cfg = store.guild(message.guild.id);
        const { antiNuke, antiRaid, antiSpam } = cfg.config;

        return message.reply({
            embeds: [new EmbedBuilder()
                .setColor("#2b1422")
                .setTitle("angela ♡ | Security Status")
                .addFields(
                    { name: "🔒 Lockdown",   value: cfg.lockdown ? "🔴 Active" : "🟢 Inactive", inline: true },
                    { name: "📋 Log Channel",value: cfg.logChannel ? `<#${cfg.logChannel}>` : "Not set", inline: true },
                    { name: "🛡️ Anti-Nuke", value: antiNuke.enabled ? "✅" : "❌", inline: true },
                    { name: "⚡ Anti-Raid",  value: antiRaid.enabled ? "✅" : "❌", inline: true },
                    { name: "🔇 Anti-Spam",  value: antiSpam.enabled ? "✅" : "❌", inline: true },
                )
                .setTimestamp()]
        });
    }
};
