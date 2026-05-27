const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, updateUser, addXP, cooldownLeft, formatCooldown, hasItem } = require("../economyStore");

const LOCAL = {
    en: { title: "hunt", found: "You hunted", earned: "Earned", wallet: "New Balance", wait: "The forest needs to recover. Come back in" },
    tl: { title: "pangaso", found: "Nahuli mo", earned: "Kinita", wallet: "Bagong Balanse", wait: "Pahinga muna ang kagubatan. Bumalik sa" },
    ko: { title: "사냥", found: "사냥한 것", earned: "획득", wallet: "현재 잔액", wait: "숲이 회복 중. 돌아오세요:" },
    ja: { title: "狩猟", found: "狩った！", earned: "獲得", wallet: "現在の残高", wait: "森が回復中。戻ってください:" },
};

const LOOT = [
    { name: "You Missed",       emoji: "💨", range: [0, 0],    rarity: "💀 Miss",      weight: 15, xp: 5   },
    { name: "Rabbit",           emoji: "🐇", range: [15, 40],  rarity: "⚪ Common",    weight: 30, xp: 15  },
    { name: "Fox",              emoji: "🦊", range: [35, 70],  rarity: "🟢 Uncommon",  weight: 20, xp: 30  },
    { name: "Boar",             emoji: "🐗", range: [60, 120], rarity: "🔵 Rare",      weight: 15, xp: 50  },
    { name: "Deer",             emoji: "🦌", range: [100, 200],rarity: "🟣 Epic",      weight: 10, xp: 75  },
    { name: "Bear",             emoji: "🐻", range: [180, 350],rarity: "🟡 Legendary", weight: 6,  xp: 120 },
    { name: "Phoenix",          emoji: "🔥", range: [400, 700],rarity: "🌈 Mythic",    weight: 3,  xp: 200 },
    { name: "Dragon (somehow)", emoji: "🐉", range: [700,1200],rarity: "✨ Impossible", weight: 1,  xp: 300 },
];

function weightedRandom(table) {
    const total = table.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * total;
    for (const item of table) { r -= item.weight; if (r <= 0) return item; }
    return table[0];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hunt")
        .setDescription("✦ Go hunting in the forest for coins (10 min cooldown)"),

    async execute(interaction) {
        const lang  = interaction.client.languages?.get(interaction.guildId) || "en";
        const t     = LOCAL[lang] || LOCAL.en;
        const u     = getUser(interaction.guildId, interaction.user.id);
        const cd    = cooldownLeft(u.lastHunt, "hunt");

        if (cd > 0) {
            return interaction.reply({ embeds: [
                new EmbedBuilder().setColor("#FF6B6B")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("⏳ Animals are hiding.")
                    .setDescription(`${t.wait} **${formatCooldown(cd)}**`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ hunt · angela" })
            ], ephemeral: true });
        }

        const hasKnife   = hasItem(interaction.guildId, interaction.user.id, "hunting_knife");
        const hasTreasure = hasItem(interaction.guildId, interaction.user.id, "treasure_map");
        const hasLucky   = hasItem(interaction.guildId, interaction.user.id, "lucky_charm");

        const boostedTable = hasTreasure
            ? LOOT.map(i => ({ ...i, weight: i.rarity.includes("Legendary") || i.rarity.includes("Mythic") || i.rarity.includes("Impossible") ? i.weight * 3 : i.weight }))
            : LOOT;

        const prey = weightedRandom(boostedTable);
        let pay    = prey.range[0] === 0 ? 0 : Math.floor(Math.random() * (prey.range[1] - prey.range[0] + 1)) + prey.range[0];
        if (hasKnife) pay = Math.floor(pay * 1.5);
        if (hasLucky) pay = Math.floor(pay * 1.25);

        const { leveled, newLevel } = addXP(interaction.guildId, interaction.user.id, prey.xp);
        updateUser(interaction.guildId, interaction.user.id, u => { u.coins += pay; u.lastHunt = Date.now(); });
        const refreshed = getUser(interaction.guildId, interaction.user.id);

        const embed = new EmbedBuilder()
            .setColor("#4CAF50")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`${prey.emoji} ${t.found}: **${prey.name}**`)
            .setDescription(`${prey.rarity}${hasKnife ? "  🔪 Knife boost active" : ""}${hasLucky ? "  🍀 Lucky boost active" : ""}`)
            .addFields(
                { name: "💰 Earned",       value: pay > 0 ? `\`+${pay} coins\`` : "`Nothing. It escaped.`", inline: true },
                { name: "✨ XP",            value: `\`+${prey.xp} XP\``, inline: true },
                { name: `👛 ${t.wallet}`,  value: `\`${refreshed.coins.toLocaleString()} coins\``, inline: true },
            )
            .setFooter({ text: leveled ? `⬆️ LEVEL UP! You are now Lv. ${newLevel}` : "˚ʚ♡ɞ˚ hunt · angela · 10m cooldown" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t    = LOCAL[lang] || LOCAL.en;
        const u    = getUser(message.guildId, message.author.id);
        const cd   = cooldownLeft(u.lastHunt, "hunt");

        if (cd > 0) return message.reply(`⏳ **${t.wait}** \`${formatCooldown(cd)}\``);

        const prey  = weightedRandom(LOOT);
        let pay     = prey.range[0] === 0 ? 0 : Math.floor(Math.random() * (prey.range[1] - prey.range[0] + 1)) + prey.range[0];
        if (hasItem(message.guildId, message.author.id, "hunting_knife")) pay = Math.floor(pay * 1.5);
        addXP(message.guildId, message.author.id, prey.xp);
        updateUser(message.guildId, message.author.id, u => { u.coins += pay; u.lastHunt = Date.now(); });

        message.reply(`${prey.emoji} **${prey.name}** — ${pay > 0 ? `\`+${pay} coins\`` : "`Missed.`"} · ${prey.rarity}`);
    },
};
