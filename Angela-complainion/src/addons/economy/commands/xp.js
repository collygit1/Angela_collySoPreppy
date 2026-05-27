const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, xpNeeded, load } = require("../economyStore");

const LOCAL = {
    en: { title: "xp", level: "Level", xp: "XP", needed: "XP to Next Level", rank: "Server Rank", top: "XP Leaderboard" },
    tl: { title: "xp", level: "Antas", xp: "XP", needed: "XP para sa Susunod", rank: "Ranggo sa Server", top: "XP Leaderboard" },
    ko: { title: "XP", level: "레벨", xp: "XP", needed: "다음 레벨까지", rank: "서버 순위", rank_val: "위", top: "XP 리더보드" },
    ja: { title: "XP", level: "レベル", xp: "XP", needed: "次のレベルまで", rank: "サーバー順位", top: "XPリーダーボード" },
};

const RANK_TITLES = [
    [1,  "🌱 Sprout"],   [5,  "🌿 Grower"],  [10, "⭐ Rising Star"],
    [20, "💫 Veteran"],  [35, "🔥 Grinder"], [50, "💎 Legend"],
    [75, "👑 Overlord"], [100,"🌌 Transcendent"],
];

function rankTitle(level) {
    let title = RANK_TITLES[0][1];
    for (const [req, name] of RANK_TITLES) if (level >= req) title = name;
    return title;
}

function xpBar(xp, level, len = 18) {
    const needed = xpNeeded(level);
    const filled = Math.round((xp / needed) * len);
    return `${"▰".repeat(filled)}${"▱".repeat(len - filled)}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("xp")
        .setDescription("✦ View your level, XP, and rank")
        .addUserOption(o => o.setName("user").setDescription("Check someone else")),

    async execute(interaction) {
        const lang   = interaction.client.languages?.get(interaction.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("user") || interaction.user;
        const u      = getUser(interaction.guildId, target.id);
        const needed = xpNeeded(u.level);

        const data  = load ? require("../economyStore").load?.() || {} : {};
        const guild = data[interaction.guildId] || {};
        const rank  = Object.values(guild)
            .sort((a, b) => (b.level * 10000 + b.xp) - (a.level * 10000 + a.xp))
            .findIndex((_, i, arr) => {
                const uid = Object.keys(guild).find(k => {
                    const entry = guild[k];
                    return entry.level === u.level && entry.xp === u.xp;
                });
                return Object.keys(guild)[i] === target.id;
            }) + 1 || "?";

        const embed = new EmbedBuilder()
            .setColor("#c9b1ff")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`✨ ${target.username} — ${rankTitle(u.level)}`)
            .setThumbnail(target.displayAvatarURL())
            .setDescription(`${xpBar(u.xp, u.level)} \`${u.xp}/${needed} XP\``)
            .addFields(
                { name: `⭐ ${t.level}`, value: `\`${u.level}\``, inline: true },
                { name: `✨ ${t.xp}`, value: `\`${u.xp} XP\``, inline: true },
                { name: `📈 ${t.needed}`, value: `\`${needed - u.xp} XP\``, inline: true },
            )
            .setFooter({ text: "˚ʚ♡ɞ˚ xp · angela" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message, args) {
        const lang   = message.client.languages?.get(message.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first() || message.author;
        const u      = getUser(message.guildId, target.id);
        const needed = xpNeeded(u.level);

        await message.reply({ embeds: [
            new EmbedBuilder().setColor("#c9b1ff")
                .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: message.client.user.displayAvatarURL() })
                .setTitle(`✨ ${target.username} — ${rankTitle(u.level)}`)
                .setDescription(`\`Lv. ${u.level}\` · ${u.xp}/${needed} XP · ${rankTitle(u.level)}`)
        ]});
    },
};
