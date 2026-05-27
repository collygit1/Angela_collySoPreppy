const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, updateUser, addXP, cooldownLeft, formatCooldown, hasItem } = require("../economyStore");

const LOCAL = {
    en: { title: "mine", found: "You found", earned: "Earned", wallet: "New Balance", wait: "The mine is still recovering. Come back in" },
    tl: { title: "mina", found: "Natuklasan mo", earned: "Kinita", wallet: "Bagong Balanse", wait: "Pahinga ang minahan. Bumalik sa" },
    ko: { title: "채굴", found: "발견한 것", earned: "획득", wallet: "현재 잔액", wait: "광산이 회복 중. 돌아오세요:" },
    ja: { title: "採掘", found: "発見！", earned: "獲得", wallet: "現在の残高", wait: "鉱山が回復中。戻ってください:" },
};

const LOOT = [
    { name: "Empty Tunnel",   emoji: "💨", range: [0, 0],    rarity: "💀 Nothing",   weight: 15, xp: 5  },
    { name: "Stone",          emoji: "🪨", range: [5, 20],   rarity: "⚪ Common",    weight: 30, xp: 10 },
    { name: "Coal",           emoji: "🖤", range: [15, 35],  rarity: "⚫ Common",    weight: 20, xp: 20 },
    { name: "Iron Ore",       emoji: "⚙️", range: [30, 70],  rarity: "🟢 Uncommon",  weight: 15, xp: 30 },
    { name: "Gold Nugget",    emoji: "🟡", range: [60, 120], rarity: "🔵 Rare",      weight: 10, xp: 50 },
    { name: "Crystal",        emoji: "💠", range: [100, 200],rarity: "🟣 Epic",      weight: 6,  xp: 75 },
    { name: "Diamond",        emoji: "💎", range: [200, 400],rarity: "🟡 Legendary", weight: 3,  xp: 120 },
    { name: "Ancient Relic",  emoji: "🏺", range: [500, 900],rarity: "🌈 Mythic",    weight: 1,  xp: 200 },
];

function weightedRandom(table) {
    const total = table.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * total;
    for (const item of table) { r -= item.weight; if (r <= 0) return item; }
    return table[0];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mine")
        .setDescription("✦ Go mining for ores and coins (10 min cooldown)"),

    async execute(interaction) {
        const lang  = interaction.client.languages?.get(interaction.guildId) || "en";
        const t     = LOCAL[lang] || LOCAL.en;
        const u     = getUser(interaction.guildId, interaction.user.id);
        const cd    = cooldownLeft(u.lastMine, "mine");

        if (cd > 0) {
            return interaction.reply({ embeds: [
                new EmbedBuilder().setColor("#FF6B6B")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("⏳ Tunnel's still collapsing.")
                    .setDescription(`${t.wait} **${formatCooldown(cd)}**`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ mine · angela" })
            ], ephemeral: true });
        }

        const hasPickaxe = hasItem(interaction.guildId, interaction.user.id, "pickaxe");
        const hasTreasure = hasItem(interaction.guildId, interaction.user.id, "treasure_map");
        const hasLucky   = hasItem(interaction.guildId, interaction.user.id, "lucky_charm");

        const boostedTable = hasTreasure
            ? LOOT.map(i => ({ ...i, weight: i.rarity.includes("Legendary") || i.rarity.includes("Mythic") ? i.weight * 3 : i.weight }))
            : LOOT;

        const ore  = weightedRandom(boostedTable);
        let pay    = ore.range[0] === 0 ? 0 : Math.floor(Math.random() * (ore.range[1] - ore.range[0] + 1)) + ore.range[0];
        if (hasPickaxe) pay = Math.floor(pay * 1.5);
        if (hasLucky)   pay = Math.floor(pay * 1.25);

        const { leveled, newLevel } = addXP(interaction.guildId, interaction.user.id, ore.xp);
        updateUser(interaction.guildId, interaction.user.id, u => { u.coins += pay; u.lastMine = Date.now(); });
        const refreshed = getUser(interaction.guildId, interaction.user.id);

        const embed = new EmbedBuilder()
            .setColor("#8B7355")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`${ore.emoji} ${t.found}: **${ore.name}**`)
            .setDescription(`${ore.rarity}${hasPickaxe ? "  ⛏️ Pickaxe boost active" : ""}${hasLucky ? "  🍀 Lucky boost active" : ""}`)
            .addFields(
                { name: "💰 Earned",       value: pay > 0 ? `\`+${pay} coins\`` : "`Nothing. The void stares back.`", inline: true },
                { name: "✨ XP",            value: `\`+${ore.xp} XP\``, inline: true },
                { name: `👛 ${t.wallet}`,  value: `\`${refreshed.coins.toLocaleString()} coins\``, inline: true },
            )
            .setFooter({ text: leveled ? `⬆️ LEVEL UP! You are now Lv. ${newLevel}` : "˚ʚ♡ɞ˚ mine · angela · 10m cooldown" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t    = LOCAL[lang] || LOCAL.en;
        const u    = getUser(message.guildId, message.author.id);
        const cd   = cooldownLeft(u.lastMine, "mine");

        if (cd > 0) return message.reply(`⏳ **${t.wait}** \`${formatCooldown(cd)}\``);

        const ore  = weightedRandom(LOOT);
        let pay    = ore.range[0] === 0 ? 0 : Math.floor(Math.random() * (ore.range[1] - ore.range[0] + 1)) + ore.range[0];
        if (hasItem(message.guildId, message.author.id, "pickaxe")) pay = Math.floor(pay * 1.5);
        addXP(message.guildId, message.author.id, ore.xp);
        updateUser(message.guildId, message.author.id, u => { u.coins += pay; u.lastMine = Date.now(); });

        message.reply(`${ore.emoji} **${ore.name}** — ${pay > 0 ? `\`+${pay} coins\`` : "`Nothing found.`"} · ${ore.rarity}`);
    },
};
