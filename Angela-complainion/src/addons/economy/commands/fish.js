const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, updateUser, addXP, cooldownLeft, formatCooldown, hasItem } = require("../economyStore");

const LOCAL = {
    en: { title: "fish", caught: "You caught", earned: "Earned", wallet: "New Balance", wait: "Rods need rest too. Come back in", noRod: "No rod equipped." },
    tl: { title: "pangisda", caught: "Nahuli mo", earned: "Kinita", wallet: "Bagong Balanse", wait: "Pahinga muna. Bumalik sa" },
    ko: { title: "낚시", caught: "잡은 것", earned: "획득", wallet: "현재 잔액", wait: "낚싯대도 쉬어야 해. 돌아오세요:" },
    ja: { title: "釣り", caught: "釣れた！", earned: "獲得", wallet: "現在の残高", wait: "竿も休憩が必要。戻ってください:" },
};

const LOOT = [
    { name: "Old Boot",      emoji: "👢", range: [1, 5],    rarity: "💀 Common",    weight: 20, xp: 5  },
    { name: "Small Fish",    emoji: "🐟", range: [10, 30],  rarity: "⚪ Common",    weight: 35, xp: 15 },
    { name: "Tropical Fish", emoji: "🐠", range: [30, 60],  rarity: "🟢 Uncommon",  weight: 20, xp: 25 },
    { name: "Pufferfish",    emoji: "🐡", range: [40, 80],  rarity: "🔵 Rare",      weight: 12, xp: 35 },
    { name: "Squid",         emoji: "🦑", range: [70, 130], rarity: "🟣 Epic",      weight: 8,  xp: 50 },
    { name: "Shark",         emoji: "🦈", range: [150, 300],rarity: "🟡 Legendary", weight: 4,  xp: 80 },
    { name: "Mermaid's Tear",emoji: "💎", range: [300, 600],rarity: "🌈 Mythic",    weight: 1,  xp: 150 },
];

const MISS = [
    "You fell asleep. The fish judged you.",
    "The fish waved. You waved back. No catch.",
    "Threw the line perfectly. Into a tree.",
    "A fish stole your bait. It left no note.",
];

function weightedRandom(table) {
    const total = table.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * total;
    for (const item of table) { r -= item.weight; if (r <= 0) return item; }
    return table[0];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fish")
        .setDescription("✦ Go fishing for coins and XP (10 min cooldown)"),

    async execute(interaction) {
        const lang  = interaction.client.languages?.get(interaction.guildId) || "en";
        const t     = LOCAL[lang] || LOCAL.en;
        const u     = getUser(interaction.guildId, interaction.user.id);
        const cd    = cooldownLeft(u.lastFish, "fish");

        if (cd > 0) {
            return interaction.reply({ embeds: [
                new EmbedBuilder().setColor("#FF6B6B")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("⏳ Bait's still in the water.")
                    .setDescription(`${t.wait} **${formatCooldown(cd)}**`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ fish · angela" })
            ], ephemeral: true });
        }

        const hasRod = hasItem(interaction.guildId, interaction.user.id, "fishing_rod");
        const hasTreasure = hasItem(interaction.guildId, interaction.user.id, "treasure_map");
        const hasLucky  = hasItem(interaction.guildId, interaction.user.id, "lucky_charm");

        const boostedTable = hasTreasure
            ? LOOT.map(i => ({ ...i, weight: i.rarity.includes("Legendary") || i.rarity.includes("Mythic") ? i.weight * 3 : i.weight }))
            : LOOT;

        const catch_ = weightedRandom(boostedTable);
        let pay = Math.floor(Math.random() * (catch_.range[1] - catch_.range[0] + 1)) + catch_.range[0];
        if (hasRod)   pay = Math.floor(pay * 1.5);
        if (hasLucky) pay = Math.floor(pay * 1.25);

        const { leveled, newLevel } = addXP(interaction.guildId, interaction.user.id, catch_.xp);
        updateUser(interaction.guildId, interaction.user.id, u => { u.coins += pay; u.lastFish = Date.now(); });
        const refreshed = getUser(interaction.guildId, interaction.user.id);

        const embed = new EmbedBuilder()
            .setColor("#4FC3F7")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`${catch_.emoji} ${t.caught}: **${catch_.name}**`)
            .setDescription(`${catch_.rarity}${hasRod ? "  🎣 Rod boost active" : ""}${hasLucky ? "  🍀 Lucky boost active" : ""}`)
            .addFields(
                { name: "💰 Earned",        value: `\`+${pay} coins\``, inline: true },
                { name: `✨ XP`,             value: `\`+${catch_.xp} XP\``, inline: true },
                { name: `👛 ${t.wallet}`,   value: `\`${refreshed.coins.toLocaleString()} coins\``, inline: true },
            )
            .setFooter({ text: leveled ? `⬆️ LEVEL UP! You are now Lv. ${newLevel}` : "˚ʚ♡ɞ˚ fish · angela · 10m cooldown" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t    = LOCAL[lang] || LOCAL.en;
        const u    = getUser(message.guildId, message.author.id);
        const cd   = cooldownLeft(u.lastFish, "fish");

        if (cd > 0) return message.reply(`⏳ **${t.wait}** \`${formatCooldown(cd)}\``);

        const catch_ = weightedRandom(LOOT);
        let pay = Math.floor(Math.random() * (catch_.range[1] - catch_.range[0] + 1)) + catch_.range[0];
        if (hasItem(message.guildId, message.author.id, "fishing_rod")) pay = Math.floor(pay * 1.5);
        addXP(message.guildId, message.author.id, catch_.xp);
        updateUser(message.guildId, message.author.id, u => { u.coins += pay; u.lastFish = Date.now(); });

        message.reply(`${catch_.emoji} **${catch_.name}** — \`+${pay} coins\` · ${catch_.rarity}`);
    },
};
