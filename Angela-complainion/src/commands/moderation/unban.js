const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

const LOCAL = {
    en: { title: "unban", subject: "Subject", reason: "Reason", executor: "Executor", notBanned: "This ID is not in the ban registry.", failed: "Unban failed" },
    tl: { title: "unban", subject: "User", reason: "Dahilan", executor: "Executor", notBanned: "Ang ID na ito ay wala sa ban list.", failed: "Nabigo ang unban" },
    ko: { title: "언밴", subject: "유저", reason: "이유", executor: "실행자", notBanned: "이 ID는 밴 목록에 없습니다.", failed: "언밴 실패" },
    ja: { title: "BAN解除", subject: "ユーザー", reason: "理由", executor: "実行者", notBanned: "このIDはBANリストにありません。", failed: "BAN解除失敗" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("✦ [Mod] Restore a banned user's access")
        .addStringOption(o => o.setName("id").setDescription("The User ID to unban").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("Reason for unban"))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const targetId = interaction.options.getString("id");
        const reason = interaction.options.getString("reason") || "Probation period concluded.";
        try {
            const banList = await interaction.guild.bans.fetch();
            const targetBan = banList.get(targetId);
            if (!targetBan) return interaction.editReply({ content: `❌ ${t.notBanned}` });
            await interaction.guild.members.unban(targetId, `By: ${interaction.user.tag} | ${reason}`);
            const embed = new EmbedBuilder()
                .setColor("#ffcad4")
                .setAuthor({ name: "angela ♡ | unban", iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(
                    `⊹ ─────────────────── ⊹\n` +
                    `✅ **${t.subject}:** \`${targetBan.user.tag}\`\n` +
                    `📋 **${t.reason}:** \`${reason}\`\n` +
                    `👤 **${t.executor}:** <@${interaction.user.id}>\n` +
                    `⊹ ─────────────────── ⊹`
                )
                .setFooter({ text: `˚ʚ♡ɞ˚ unban · angela · ${lang.toUpperCase()}` })
                .setTimestamp();
            await interaction.channel.send({ embeds: [embed] });
            return interaction.editReply({ content: "✅ **Access restored.**" });
        } catch (err) {
            return interaction.editReply({ content: `❌ **${t.failed}:** ${err.message}` });
        }
    }
};
