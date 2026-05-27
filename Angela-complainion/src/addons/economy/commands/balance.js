const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, xpNeeded } = require("../economyStore");

const LOCAL = {
    en: { title: "balance", wallet: "Wallet", bank: "Bank", total: "Net Worth", level: "Level", xp: "XP Progress", inv: "Items", noItems: "Empty pockets. Tragic." },
    tl: { title: "balanse", wallet: "Pitaka", bank: "Bangko", total: "Kabuuang Halaga", level: "Antas", xp: "XP Progress", inv: "Mga Item", noItems: "Wala sa bag. Kawawa naman." },
    ko: { title: "잔액", wallet: "지갑", bank: "은행", total: "순자산", level: "레벨", xp: "XP 진행도", inv: "아이템", noItems: "빈 주머니. 슬프다." },
    ja: { title: "残高", wallet: "財布", bank: "銀行", total: "純資産", level: "レベル", xp: "XP進行度", inv: "アイテム", noItems: "空っぽ。悲しい。" },
};

function xpBar(xp, level, len = 16) {
    const needed = xpNeeded(level);
    const filled = Math.round((xp / needed) * len);
    return `${"▰".repeat(filled)}${"▱".repeat(len - filled)} \`${xp}/${needed}\``;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("✦ Check your wallet, bank, and level")
        .addUserOption(o => o.setName("user").setDescription("Check someone else's balance")),

    async execute(interaction) {
        const lang   = interaction.client.languages?.get(interaction.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("user") || interaction.user;
        const u      = getUser(interaction.guildId, target.id);

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`💰 ${target.username}`)
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: `👛 ${t.wallet}`, value: `\`${u.coins.toLocaleString()} coins\``, inline: true },
                { name: `🏦 ${t.bank}`, value: `\`${u.bank.toLocaleString()} coins\``, inline: true },
                { name: `💎 ${t.total}`, value: `\`${(u.coins + u.bank).toLocaleString()} coins\``, inline: true },
                { name: `⭐ ${t.level}`, value: `\`Lv. ${u.level}\``, inline: true },
                { name: `✨ ${t.xp}`, value: xpBar(u.xp, u.level), inline: false },
                { name: `🎒 ${t.inv}`, value: u.inventory.length > 0 ? u.inventory.map(i => i.replace(/_/g, " ")).join(", ") : t.noItems, inline: false },
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ balance · angela` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message, args) {
        const lang   = message.client.languages?.get(message.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first() || message.author;
        const u      = getUser(message.guildId, target.id);

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: message.client.user.displayAvatarURL() })
            .setTitle(`💰 ${target.username}`)
            .addFields(
                { name: `👛 ${t.wallet}`, value: `\`${u.coins.toLocaleString()} coins\``, inline: true },
                { name: `🏦 ${t.bank}`, value: `\`${u.bank.toLocaleString()} coins\``, inline: true },
                { name: `⭐ ${t.level}`, value: `\`Lv. ${u.level}\``, inline: true },
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ balance · angela` });

        await message.reply({ embeds: [embed] });
    },
};
