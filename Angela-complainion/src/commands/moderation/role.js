const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

const LOCAL = {
    en: { title: "role", target: "Target", role: "Role", action: "Action", executor: "Executor", added: "Role Added", removed: "Role Removed", notFound: "Member not found.", cantManage: "I cannot manage that role (it may be higher than mine).", failed: "Role action failed" },
    tl: { title: "role", target: "Target", role: "Role", action: "Aksyon", executor: "Executor", added: "Role Idinagdag", removed: "Role Tinanggal", notFound: "Hindi mahanap ang miyembro.", cantManage: "Hindi ko ma-manage ang role na iyon.", failed: "Nabigo ang role action" },
    ko: { title: "역할", target: "대상", role: "역할", action: "작업", executor: "실행자", added: "역할 추가됨", removed: "역할 제거됨", notFound: "멤버를 찾을 수 없습니다.", cantManage: "해당 역할을 관리할 수 없습니다.", failed: "역할 작업 실패" },
    ja: { title: "ロール", target: "対象", role: "ロール", action: "アクション", executor: "実行者", added: "ロール追加済み", removed: "ロール削除済み", notFound: "メンバーが見つかりません。", cantManage: "そのロールを管理できません。", failed: "ロール操作失敗" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("✦ [Mod] Add or remove a role from a member")
        .addSubcommand(s => s.setName("add").setDescription("Add a role to a member")
            .addUserOption(o => o.setName("target").setDescription("Member").setRequired(true))
            .addRoleOption(o => o.setName("role").setDescription("Role to add").setRequired(true)))
        .addSubcommand(s => s.setName("remove").setDescription("Remove a role from a member")
            .addUserOption(o => o.setName("target").setDescription("Member").setRequired(true))
            .addRoleOption(o => o.setName("role").setDescription("Role to remove").setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getMember("target");
        const role = interaction.options.getRole("role");

        if (!target) return interaction.editReply({ content: `❌ ${t.notFound}` });

        const botMember = interaction.guild.members.me;
        if (role.position >= botMember.roles.highest.position) {
            return interaction.editReply({ content: `❌ ${t.cantManage}` });
        }

        try {
            if (sub === "add") await target.roles.add(role);
            else await target.roles.remove(role);

            const actionLabel = sub === "add" ? t.added : t.removed;
            const color = sub === "add" ? "#2ED573" : "#FF4757";

            const store = require("../../database/securityStore");
            const cfg = store.guild(interaction.guild.id);
            if (cfg?.logChannel) {
                const logCh = interaction.guild.channels.cache.get(cfg.logChannel);
                await logCh?.send({ embeds: [
                    new EmbedBuilder().setColor(color).setTitle(`🎭 ${t.title.toUpperCase()} — ${actionLabel}`)
                        .addFields(
                            { name: t.target, value: `${target.user.tag}`, inline: true },
                            { name: t.role, value: `${role}`, inline: true },
                            { name: t.executor, value: `${interaction.user.tag}`, inline: true },
                        ).setTimestamp()
                ]}).catch(() => {});
            }

            await interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor(color)
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setDescription(`🎭 **${actionLabel}:** ${role} → ${target.user.tag}`)
                    .setTimestamp()
            ]});
        } catch {
            await interaction.editReply({ content: `❌ ${t.failed}.` });
        }
    },
};
