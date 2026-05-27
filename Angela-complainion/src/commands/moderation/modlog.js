const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const store = require("../../database/securityStore");

const LOCAL = {
    en: { title: "modlog", set: "Mod Log Channel Set", disable: "Mod Log Disabled", current: "Current Channel", none: "Not configured", channel: "Channel", executor: "Executor" },
    tl: { title: "modlog", set: "Mod Log Channel na-set", disable: "Mod Log Na-disable", current: "Kasalukuyang Channel", none: "Hindi na-configure", channel: "Channel", executor: "Executor" },
    ko: { title: "모드로그", set: "모드 로그 채널 설정됨", disable: "모드 로그 비활성화됨", current: "현재 채널", none: "설정되지 않음", channel: "채널", executor: "실행자" },
    ja: { title: "モドログ", set: "モドログチャンネル設定済み", disable: "モドログ無効化済み", current: "現在のチャンネル", none: "未設定", channel: "チャンネル", executor: "実行者" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("modlog")
        .setDescription("✦ [Admin] Configure the mod log channel")
        .addSubcommand(s => s.setName("set").setDescription("Set the mod log channel")
            .addChannelOption(o => o.setName("channel").setDescription("Channel for mod logs").setRequired(true)
                .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(s => s.setName("disable").setDescription("Disable mod logging"))
        .addSubcommand(s => s.setName("view").setDescription("View the current mod log channel"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const sub = interaction.options.getSubcommand();
        const cfg = store.guild(interaction.guild.id);

        if (sub === "set") {
            const channel = interaction.options.getChannel("channel");
            store.setLogChannel(interaction.guild.id, channel.id);

            await interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor("#2ED573")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle(`📋 ${t.set}`)
                    .addFields(
                        { name: t.channel, value: `<#${channel.id}>`, inline: true },
                        { name: t.executor, value: `${interaction.user.tag}`, inline: true },
                    )
                    .setTimestamp()
            ]});

        } else if (sub === "disable") {
            store.setLogChannel(interaction.guild.id, null);

            await interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor("#FF4757")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle(`📋 ${t.disable}`)
                    .setTimestamp()
            ]});

        } else {
            const currentId = cfg?.logChannel;
            await interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor("#747DFF")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle(`📋 ${t.title.toUpperCase()}`)
                    .addFields({ name: t.current, value: currentId ? `<#${currentId}>` : t.none })
                    .setTimestamp()
            ]});
        }
    },
};
