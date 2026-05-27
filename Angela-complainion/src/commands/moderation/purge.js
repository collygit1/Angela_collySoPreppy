const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

const LOCAL = {
    en: { title: "purge", deleted: "Messages Deleted", target: "Target User", channel: "Channel", executor: "Executor", done: "purged", none: "No recent messages found from that user.", failed: "Purge failed" },
    tl: { title: "purge", deleted: "Mga Mensaheng Nabura", target: "Target User", channel: "Channel", executor: "Executor", done: "nabura", none: "Walang nahanap na mensahe mula sa user na iyon.", failed: "Nabigo ang purge" },
    ko: { title: "제거", deleted: "삭제된 메시지", target: "대상 사용자", channel: "채널", executor: "실행자", done: "제거됨", none: "해당 사용자의 최근 메시지를 찾을 수 없습니다.", failed: "제거 실패" },
    ja: { title: "パージ", deleted: "削除されたメッセージ", target: "対象ユーザー", channel: "チャンネル", executor: "実行者", done: "パージ済み", none: "そのユーザーの最近のメッセージが見つかりません。", failed: "パージ失敗" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("✦ [Mod] Delete messages from a specific user")
        .addUserOption(o => o.setName("target").setDescription("User whose messages to delete").setRequired(true))
        .addIntegerOption(o => o.setName("amount").setDescription("Max messages to scan (1–100, default 50)").setMinValue(1).setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const targetUser = interaction.options.getUser("target");
        const amount = interaction.options.getInteger("amount") || 50;
        const channel = interaction.channel;

        try {
            const messages = await channel.messages.fetch({ limit: amount });
            const toDelete = messages.filter(m => m.author.id === targetUser.id);

            if (toDelete.size === 0) return interaction.editReply({ content: `❌ ${t.none}` });

            const deleted = await channel.bulkDelete(toDelete, true);

            const store = require("../../database/securityStore");
            const cfg = store.guild(interaction.guild.id);
            if (cfg?.logChannel) {
                const logCh = interaction.guild.channels.cache.get(cfg.logChannel);
                await logCh?.send({ embeds: [
                    new EmbedBuilder().setColor("#FF4757").setTitle(`🗑️ ${t.title.toUpperCase()}`)
                        .addFields(
                            { name: t.target, value: `${targetUser.tag}`, inline: true },
                            { name: t.deleted, value: `${deleted.size}`, inline: true },
                            { name: t.executor, value: `${interaction.user.tag}`, inline: true },
                        ).setTimestamp()
                ]}).catch(() => {});
            }

            await interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor("#FF4757")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setDescription(`🗑️ **${deleted.size}** messages from **${targetUser.tag}** ${t.done}.`)
                    .setTimestamp()
            ]});
        } catch {
            await interaction.editReply({ content: `❌ ${t.failed}.` });
        }
    },
};
