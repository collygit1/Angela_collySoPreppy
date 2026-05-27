const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

const LOCAL = {
    en: { title: "slowmode", channel: "Channel", delay: "Delay", executor: "Executor", off: "Off", set: "Slowmode set", failed: "Slowmode failed" },
    tl: { title: "slowmode", channel: "Channel", delay: "Tagal", executor: "Executor", off: "Naka-off", set: "Slowmode na-set", failed: "Nabigo ang slowmode" },
    ko: { title: "슬로우모드", channel: "채널", delay: "지연", executor: "실행자", off: "꺼짐", set: "슬로우모드 설정됨", failed: "슬로우모드 실패" },
    ja: { title: "スローモード", channel: "チャンネル", delay: "遅延", executor: "実行者", off: "オフ", set: "スローモード設定済み", failed: "スローモード失敗" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("✦ [Mod] Set channel slowmode")
        .addIntegerOption(o => o.setName("seconds").setDescription("Slowmode delay in seconds (0 = off, max 21600)").setRequired(true).setMinValue(0).setMaxValue(21600))
        .addChannelOption(o => o.setName("channel").setDescription("Target channel (defaults to current)"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const seconds = interaction.options.getInteger("seconds");
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        try {
            await channel.setRateLimitPerUser(seconds);

            const displayDelay = seconds === 0 ? t.off : `${seconds}s`;

            const store = require("../../database/securityStore");
            const cfg = store.guild(interaction.guild.id);
            if (cfg?.logChannel) {
                const logCh = interaction.guild.channels.cache.get(cfg.logChannel);
                await logCh?.send({ embeds: [
                    new EmbedBuilder().setColor("#747DFF").setTitle(`🐢 ${t.title.toUpperCase()}`)
                        .addFields(
                            { name: t.channel, value: `<#${channel.id}>`, inline: true },
                            { name: t.delay, value: displayDelay, inline: true },
                            { name: t.executor, value: `${interaction.user.tag}`, inline: true },
                        ).setTimestamp()
                ]}).catch(() => {});
            }

            await interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor("#747DFF")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setDescription(`🐢 <#${channel.id}> slowmode → **${displayDelay}**`)
                    .setTimestamp()
            ]});
        } catch {
            await interaction.editReply({ content: `❌ ${t.failed}.` });
        }
    },
};
