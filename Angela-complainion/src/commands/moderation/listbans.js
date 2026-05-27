const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

const LOCAL = {
    en: { title: "ban list", clean: "No bans found — the server is clean ✦", total: "Total Bans" },
    tl: { title: "listahan ng ban", clean: "Walang ban — malinis ang server ✦", total: "Kabuuang Bans" },
    ko: { title: "밴 목록", clean: "밴 없음 — 서버가 깨끗해요 ✦", total: "총 밴 수" },
    ja: { title: "BANリスト", clean: "BANなし — サーバーはクリーンです ✦", total: "総BAN数" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("banlist")
        .setDescription("✦ [Mod] View the security blacklist")
        .setDefaultMemberPermissions(8n),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        try {
            const bans = await interaction.guild.bans.fetch();
            if (bans.size === 0) return interaction.editReply({ content: `✨ ${t.clean}` });
            const list = bans.map(b => `꒰ \`${b.user.id}\` — **${b.user.tag}** ꒱`).slice(0, 15).join("\n");
            const more = bans.size > 15 ? `\n*...and ${bans.size - 15} more*` : "";
            const embed = new EmbedBuilder()
                .setColor("#2b1422")
                .setAuthor({ name: "angela ♡ | ban list", iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(
                    `⊹ ─────────────────── ⊹\n` +
                    `🔒 **Banned Users**\n${list}${more}\n\n` +
                    `📊 **${t.total}:** \`${bans.size}\`\n` +
                    `⊹ ─────────────────── ⊹`
                )
                .setFooter({ text: `˚ʚ♡ɞ˚ banlist · angela · ${lang.toUpperCase()}` })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        } catch (err) {
            return interaction.editReply({ content: "❌ **Failed to access ban registry.**" });
        }
    }
};
