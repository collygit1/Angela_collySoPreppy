const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require("discord.js");
const { bot } = require("../../config/settings");

const LOCAL = {
    en: { title: "rename", oldName: "Old Name", newName: "New Name", target: "Target", ownerOnly: "Only the owner can rename Angela.", noTarget: "No target provided.", notFound: "Target not found.", cantManage: "Cannot manage this member.", failed: "Rename failed" },
    tl: { title: "rename", oldName: "Lumang Pangalan", newName: "Bagong Pangalan", target: "Target", ownerOnly: "Ang may-ari lang ang makapag-rename kay Angela.", noTarget: "Walang target.", notFound: "Hindi mahanap ang target.", cantManage: "Hindi ma-manage ang miyembro.", failed: "Nabigo ang rename" },
    ko: { title: "이름 변경", oldName: "이전 이름", newName: "새 이름", target: "대상", ownerOnly: "소유자만 Angela의 이름을 변경할 수 있습니다.", noTarget: "대상 없음.", notFound: "대상을 찾을 수 없습니다.", cantManage: "이 멤버를 관리할 수 없습니다.", failed: "이름 변경 실패" },
    ja: { title: "名前変更", oldName: "旧名前", newName: "新名前", target: "対象", ownerOnly: "オーナーのみAngela の名前を変更できます。", noTarget: "対象なし。", notFound: "対象が見つかりません。", cantManage: "このメンバーを管理できません。", failed: "名前変更失敗" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rename")
        .setDescription("✦ [Mod] Rename a member or the bot")
        .addStringOption(o => o.setName("name").setDescription("The new name").setRequired(true))
        .addBooleanOption(o => o.setName("bot").setDescription("Rename Angela instead? (True = Bot)"))
        .addStringOption(o => o.setName("target").setDescription("Member mention or User ID"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const newName = interaction.options.getString("name");
        const isBot = interaction.options.getBoolean("bot") || false;
        const targetInput = interaction.options.getString("target");
        try {
            if (isBot) {
                if (interaction.user.id !== bot.owner && interaction.user.id !== "1457631388047118429")
                    return interaction.editReply({ content: `❌ ${t.ownerOnly}` });
                await interaction.guild.members.me.setNickname(newName);
                const embed = new EmbedBuilder().setColor("#ffcad4")
                    .setAuthor({ name: "angela ♡ | rename", iconURL: interaction.client.user.displayAvatarURL() })
                    .setDescription(`⊹ ─────────────────── ⊹\n🏷️ **Angela** renamed to: \`${newName}\`\n⊹ ─────────────────── ⊹`)
                    .setFooter({ text: `˚ʚ♡ɞ˚ rename · angela · ${lang.toUpperCase()}` });
                return interaction.editReply({ embeds: [embed] });
            }
            if (!targetInput) return interaction.editReply({ content: `❌ ${t.noTarget}` });
            const targetId = targetInput.replace(/[<@!>]/g, "");
            const member = await interaction.guild.members.fetch(targetId).catch(() => null);
            if (!member) return interaction.editReply({ content: `❌ ${t.notFound}` });
            if (!member.manageable) return interaction.editReply({ content: `❌ ${t.cantManage}` });
            const oldName = member.displayName;
            await member.setNickname(newName);
            const embed = new EmbedBuilder()
                .setColor("#ffcad4")
                .setAuthor({ name: "angela ♡ | rename", iconURL: interaction.client.user.displayAvatarURL() })
                .setThumbnail(member.user.displayAvatarURL())
                .setDescription(
                    `⊹ ─────────────────── ⊹\n` +
                    `🏷️ **${t.target}:** <@${member.id}>\n` +
                    `📝 **${t.oldName}:** \`${oldName}\`\n` +
                    `✨ **${t.newName}:** \`${newName}\`\n` +
                    `⊹ ─────────────────── ⊹`
                )
                .setFooter({ text: `˚ʚ♡ɞ˚ rename · angela · ${lang.toUpperCase()}` })
                .setTimestamp();
            await interaction.channel.send({ embeds: [embed] });
            return interaction.editReply({ content: "✅ **Name updated.**" });
        } catch (err) {
            return interaction.editReply({ content: `❌ **${t.failed}:** ${err.message}` });
        }
    }
};
