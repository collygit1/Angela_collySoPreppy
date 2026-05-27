const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const ms = require("ms");

const LOCAL = {
    en: { title: "mute", user: "User", duration: "Duration", reason: "Reason", executor: "Executor", notFound: "Target not found.", selfMute: "You cannot mute yourself.", cantMute: "Target has higher clearance.", invalidDur: "Invalid duration. Use formats like 10m, 1h, 7d (max 28d).", failed: "Mute failed" },
    tl: { title: "mute", user: "User", duration: "Tagal", reason: "Dahilan", executor: "Executor", notFound: "Hindi mahanap ang target.", selfMute: "Hindi mo ma-mute ang iyong sarili.", cantMute: "Mas mataas ang clearance ng target.", invalidDur: "Hindi wastong tagal. Gamitin ang 10m, 1h, 7d (max 28d).", failed: "Nabigo ang mute" },
    ko: { title: "뮤트", user: "유저", duration: "기간", reason: "이유", executor: "실행자", notFound: "대상을 찾을 수 없습니다.", selfMute: "자신을 뮤트할 수 없습니다.", cantMute: "대상의 권한이 더 높습니다.", invalidDur: "잘못된 기간. 10m, 1h, 7d 형식 사용 (최대 28d).", failed: "뮤트 실패" },
    ja: { title: "ミュート", user: "ユーザー", duration: "期間", reason: "理由", executor: "実行者", notFound: "対象が見つかりません。", selfMute: "自分自身をミュートできません。", cantMute: "対象の権限が高すぎます。", invalidDur: "無効な期間。10m, 1h, 7d 形式で (最大28d)。", failed: "ミュート失敗" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("✦ [Mod] Timeout a member")
        .addStringOption(o => o.setName("target").setDescription("Member mention or User ID").setRequired(true))
        .addStringOption(o => o.setName("duration").setDescription("Time (e.g., 10m, 1h, 1d)").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("Reason"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const targetInput = interaction.options.getString("target").replace(/[<@!>]/g, "");
        const durationInput = interaction.options.getString("duration");
        const reason = interaction.options.getString("reason") || "No reason provided";
        try {
            const member = await interaction.guild.members.fetch(targetInput).catch(() => null);
            if (!member) return interaction.editReply({ content: `❌ ${t.notFound}` });
            if (member.id === interaction.user.id) return interaction.editReply({ content: `❌ ${t.selfMute}` });
            if (!member.moderatable) return interaction.editReply({ content: `❌ ${t.cantMute}` });
            const durationMs = ms(durationInput);
            if (!durationMs || durationMs > 2419200000) return interaction.editReply({ content: `❌ ${t.invalidDur}` });
            await member.timeout(durationMs, `By: ${interaction.user.tag} | ${reason}`);
            const embed = new EmbedBuilder()
                .setColor("#2b1422")
                .setAuthor({ name: "angela ♡ | mute", iconURL: interaction.client.user.displayAvatarURL() })
                .setThumbnail(member.user.displayAvatarURL())
                .setDescription(
                    `⊹ ─────────────────── ⊹\n` +
                    `🔇 **${t.user}:** \`${member.user.tag}\`\n` +
                    `⏰ **${t.duration}:** \`${durationInput}\`\n` +
                    `📋 **${t.reason}:** \`${reason}\`\n` +
                    `👤 **${t.executor}:** <@${interaction.user.id}>\n` +
                    `⊹ ─────────────────── ⊹`
                )
                .setFooter({ text: `˚ʚ♡ɞ˚ mute · angela · ${lang.toUpperCase()}` })
                .setTimestamp();
            await interaction.channel.send({ embeds: [embed] });
            return interaction.editReply({ content: "✅ **Timeout applied.**" });
        } catch (err) {
            return interaction.editReply({ content: `❌ **${t.failed}:** ${err.message}` });
        }
    }
};
