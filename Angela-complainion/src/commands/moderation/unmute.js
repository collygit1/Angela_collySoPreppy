const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

const LOCAL = {
    en: { title: "unmute", subject: "Subject", notMuted: "This member is not currently muted.", failed: "Unmute failed" },
    tl: { title: "unmute", subject: "User", notMuted: "Hindi naka-mute ang miyembro.", failed: "Nabigo ang unmute" },
    ko: { title: "언뮤트", subject: "유저", notMuted: "이 멤버는 현재 뮤트 상태가 아닙니다.", failed: "언뮤트 실패" },
    ja: { title: "ミュート解除", subject: "ユーザー", notMuted: "このメンバーは現在ミュートされていません。", failed: "ミュート解除失敗" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("✦ [Mod] Remove a timeout from a member")
        .addUserOption(o => o.setName("target").setDescription("Member to unmute").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getMember("target");
        if (!target || !target.isCommunicationDisabled()) return interaction.editReply({ content: `❌ ${t.notMuted}` });
        try {
            await target.timeout(null);
            const embed = new EmbedBuilder()
                .setColor("#ffcad4")
                .setAuthor({ name: "angela ♡ | unmute", iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(
                    `⊹ ─────────────────── ⊹\n` +
                    `🔊 **${t.subject}:** ${target}\n` +
                    `✨ *Timeout lifted. Transmissions restored~*\n` +
                    `⊹ ─────────────────── ⊹`
                )
                .setFooter({ text: `˚ʚ♡ɞ˚ unmute · angela · ${lang.toUpperCase()}` })
                .setTimestamp();
            await interaction.channel.send({ embeds: [embed] });
            return interaction.editReply({ content: "✅ **Timeout removed.**" });
        } catch (err) {
            return interaction.editReply({ content: `❌ **${t.failed}:** ${err.message}` });
        }
    }
};
