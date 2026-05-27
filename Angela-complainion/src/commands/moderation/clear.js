const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

const LOCAL = {
    en: { title: "clear", deleted: "Messages Deleted", channel: "Channel", executor: "Executor", done: "deleted", tooOld: "Some messages were too old to delete (14+ days).", failed: "Clear failed" },
    tl: { title: "clear", deleted: "Mga Mensaheng Nabura", channel: "Channel", executor: "Executor", done: "nabura", tooOld: "Ang ilang mensahe ay masyadong luma para burahin (14+ araw).", failed: "Nabigo ang clear" },
    ko: { title: "지우기", deleted: "삭제된 메시지", channel: "채널", executor: "실행자", done: "삭제됨", tooOld: "일부 메시지는 너무 오래되어 삭제할 수 없습니다 (14일+).", failed: "지우기 실패" },
    ja: { title: "クリア", deleted: "削除されたメッセージ", channel: "チャンネル", executor: "実行者", done: "削除済み", tooOld: "一部のメッセージは古すぎて削除できませんでした (14日以上)。", failed: "クリア失敗" },
};

async function sendModLog(guild, client, t, amount, channel, executor) {
    const { default: store } = await import("../../database/securityStore.js").catch(() => ({ default: require("../../database/securityStore") }));
    const cfg = store.guild(guild.id);
    if (!cfg?.logChannel) return;
    const logCh = guild.channels.cache.get(cfg.logChannel);
    if (!logCh) return;
    await logCh.send({ embeds: [
        new EmbedBuilder()
            .setColor("#FFA502")
            .setTitle(`🧹 ${t.title.toUpperCase()}`)
            .addFields(
                { name: t.deleted, value: `${amount}`, inline: true },
                { name: t.channel, value: `<#${channel.id}>`, inline: true },
                { name: t.executor, value: `${executor.tag}`, inline: true },
            )
            .setTimestamp()
    ]}).catch(() => {});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("✦ [Mod] Bulk delete messages")
        .addIntegerOption(o => o.setName("amount").setDescription("Number of messages to delete (1–100)").setRequired(true).setMinValue(1).setMaxValue(100))
        .addChannelOption(o => o.setName("channel").setDescription("Target channel (defaults to current)"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const amount = interaction.options.getInteger("amount");
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        try {
            const deleted = await channel.bulkDelete(amount, true);
            await sendModLog(interaction.guild, client, t, deleted.size, channel, interaction.user);

            const embed = new EmbedBuilder()
                .setColor("#FFA502")
                .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(`🧹 **${deleted.size}** ${t.done} in <#${channel.id}>.`)
                .setFooter({ text: deleted.size < amount ? t.tooOld : "" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch {
            await interaction.editReply({ content: `❌ ${t.failed}.` });
        }
    },
};
