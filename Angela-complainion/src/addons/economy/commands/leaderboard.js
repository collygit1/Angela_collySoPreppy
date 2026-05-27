const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getLeaderboard } = require("../economyStore");

const LOCAL = {
    en: { title: "leaderboard", top: "Top 10 Richest", wealth: "Net Worth", empty: "No economy data yet. Go earn some coins." },
    tl: { title: "leaderboard", top: "Top 10 Pinakamayaman", wealth: "Kabuuang Yaman", empty: "Wala pang data. Kumita muna." },
    ko: { title: "리더보드", top: "상위 10명 부자", wealth: "순자산", empty: "아직 경제 데이터가 없습니다." },
    ja: { title: "リーダーボード", top: "富豪トップ10", wealth: "純資産", empty: "まだデータがありません。" },
};

const MEDALS = ["🥇", "🥈", "🥉", "4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("✦ View the top 10 richest players in the server")
        .addStringOption(o => o.setName("type").setDescription("Sort by wealth or level")
            .addChoices({ name: "Wealth (default)", value: "wealth" }, { name: "Level / XP", value: "level" })),

    async execute(interaction) {
        const lang  = interaction.client.languages?.get(interaction.guildId) || "en";
        const t     = LOCAL[lang] || LOCAL.en;
        const type  = interaction.options.getString("type") || "wealth";
        const board = getLeaderboard(interaction.guildId, 10);

        if (board.length === 0) {
            return interaction.reply({ embeds: [
                new EmbedBuilder().setColor("#FFD700")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setDescription(t.empty)
            ]});
        }

        await interaction.deferReply();

        const rows = await Promise.all(board.map(async (entry, i) => {
            let username = `User ${entry.uid.slice(-4)}`;
            try {
                const member = await interaction.guild.members.fetch(entry.uid).catch(() => null);
                if (member) username = member.user.username;
            } catch {}
            const medal = MEDALS[i] || `${i + 1}.`;
            return `${medal} **${username}** · \`${entry.total.toLocaleString()} coins\` · Lv.${entry.level}`;
        }));

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`💎 ${t.top}`)
            .setDescription(rows.join("\n"))
            .setFooter({ text: `˚ʚ♡ɞ˚ ${interaction.guild.name} · angela` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        const lang  = message.client.languages?.get(message.guildId) || "en";
        const t     = LOCAL[lang] || LOCAL.en;
        const board = getLeaderboard(message.guildId, 10);

        if (board.length === 0) return message.reply(t.empty);

        const rows = await Promise.all(board.map(async (entry, i) => {
            let username = `User ${entry.uid.slice(-4)}`;
            try {
                const member = await message.guild.members.fetch(entry.uid).catch(() => null);
                if (member) username = member.user.username;
            } catch {}
            return `${MEDALS[i] || `${i+1}.`} **${username}** · \`${entry.total.toLocaleString()} coins\` · Lv.${entry.level}`;
        }));

        await message.reply({ embeds: [
            new EmbedBuilder().setColor("#FFD700")
                .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: message.client.user.displayAvatarURL() })
                .setTitle(`💎 ${t.top}`)
                .setDescription(rows.join("\n"))
        ]});
    },
};
