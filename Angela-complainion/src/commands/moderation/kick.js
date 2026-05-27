const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

const LOCAL = {
    en: { title: "kick", user: "User", reason: "Reason", status: "Forcibly Removed", notFound: "Target not found.", cantKick: "Cannot kick this member.", failed: "Kick failed" },
    tl: { title: "kick", user: "User", reason: "Dahilan", status: "Pinilit na Tinanggal", notFound: "Hindi mahanap ang target.", cantKick: "Hindi maki-kick ang miyembro.", failed: "Nabigo ang kick" },
    ko: { title: "킥", user: "유저", reason: "이유", status: "강제 제거됨", notFound: "대상을 찾을 수 없습니다.", cantKick: "이 멤버를 킥할 수 없습니다.", failed: "킥 실패" },
    ja: { title: "キック", user: "ユーザー", reason: "理由", status: "強制退出", notFound: "対象が見つかりません。", cantKick: "このメンバーをキックできません。", failed: "キック失敗" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("✦ [Mod] Remove a member from the server")
        .addUserOption(o => o.setName("target").setDescription("Member to kick").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("Reason for kick"))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getMember("target");
        const reason = interaction.options.getString("reason") || "No reason provided";
        if (!target) return interaction.editReply({ content: `❌ ${t.notFound}` });
        if (!target.kickable) return interaction.editReply({ content: `❌ ${t.cantKick}` });
        try {
            await target.kick(`By: ${interaction.user.tag} | ${reason}`);
            const embed = new EmbedBuilder()
                .setColor("#2b1422")
                .setAuthor({ name: "angela ♡ | kick", iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(
                    `⊹ ─────────────────── ⊹\n` +
                    `👢 **${t.user}:** \`${target.user.tag}\`\n` +
                    `📋 **${t.reason}:** \`${reason}\`\n` +
                    `✦ **Status:** \`${t.status}\`\n` +
                    `⊹ ─────────────────── ⊹`
                )
                .setFooter({ text: `˚ʚ♡ɞ˚ kick · angela · ${lang.toUpperCase()}` })
                .setTimestamp();
            await interaction.channel.send({ embeds: [embed] });
            return interaction.editReply({ content: "✅ **Kick complete.**" });
        } catch (err) {
            return interaction.editReply({ content: `❌ **${t.failed}:** ${err.message}` });
        }
    }
};
