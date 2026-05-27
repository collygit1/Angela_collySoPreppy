const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

const LOCAL = {
    en: { title: "ban", entity: "Entity", sentence: "Sentence", sin: "Reason", erased: "Presence Erased", noTarget: "Provide a target or User ID.", failed: "Ritual failed" },
    tl: { title: "ban", entity: "User", sentence: "Sentensya", sin: "Dahilan", erased: "Mensahe Tinanggal", noTarget: "Magbigay ng target o User ID.", failed: "Bigo ang ban" },
    ko: { title: "밴", entity: "유저", sentence: "기간", sin: "이유", erased: "메시지 삭제", noTarget: "대상 또는 사용자 ID를 제공하세요.", failed: "밴 실패" },
    ja: { title: "BAN", entity: "ユーザー", sentence: "期間", sin: "理由", erased: "メッセージ削除", noTarget: "対象またはユーザーIDを指定してください。", failed: "BAN失敗" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("✦ [Mod] Banish a soul from the realm")
        .addStringOption(o => o.setName("duration").setDescription("Permanency (e.g., Permanent, Temporary)").setRequired(true))
        .addUserOption(o => o.setName("target").setDescription("The soul to banish"))
        .addStringOption(o => o.setName("id").setDescription("Banish by User ID"))
        .addStringOption(o => o.setName("time").setDescription("Time if temporary (e.g. 1d, 12h)"))
        .addStringOption(o => o.setName("reason").setDescription("The sin committed"))
        .addBooleanOption(o => o.setName("delete_messages").setDescription("Erase messages from last 7 days?"))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const targetUser = interaction.options.getUser("target");
        const targetID = interaction.options.getString("id");
        const duration = interaction.options.getString("duration");
        const time = interaction.options.getString("time") || "";
        const reason = interaction.options.getString("reason") || "No reason provided";
        const deleteMessages = interaction.options.getBoolean("delete_messages") || false;
        let targetIdToBan, targetTag = "Unknown";
        if (targetUser) { targetIdToBan = targetUser.id; targetTag = targetUser.tag; }
        else if (targetID) { targetIdToBan = targetID; targetTag = `ID: ${targetID}`; }
        else return interaction.editReply({ content: `🎀 **${t.noTarget}**` });
        try {
            await interaction.guild.members.ban(targetIdToBan, { reason: `By: ${interaction.user.tag} | ${reason}`, deleteMessageSeconds: deleteMessages ? 604800 : 0 });
            const embed = new EmbedBuilder()
                .setColor("#2b1422")
                .setAuthor({ name: "angela ♡ | ban", iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(
                    `⊹ ─────────────────── ⊹\n` +
                    `🔨 **${t.entity}:** \`${targetTag}\`\n` +
                    `⏳ **${t.sentence}:** \`${duration}${time ? ` (${time})` : ""}\`\n` +
                    `📋 **${t.sin}:** \`${reason}\`\n` +
                    `🗑️ **${t.erased}:** \`${deleteMessages ? "Yes" : "No"}\`\n` +
                    `⊹ ─────────────────── ⊹`
                )
                .setFooter({ text: `˚ʚ♡ɞ˚ ban · angela · ${lang.toUpperCase()}` })
                .setTimestamp();
            await interaction.channel.send({ embeds: [embed] });
            return interaction.editReply({ content: "✅ **Banishment complete.**" });
        } catch (err) {
            return interaction.editReply({ content: `❌ **${t.failed}:** ${err.message}` });
        }
    }
};
