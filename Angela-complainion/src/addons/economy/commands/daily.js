const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, updateUser, addXP, cooldownLeft, formatCooldown } = require("../economyStore");

const LOCAL = {
    en: { title: "daily", claimed: "Daily Claimed", cooldown: "Still cooling down", wallet: "New Balance", earned: "Earned", streak: "Streak", streakBonus: "Streak Bonus", wait: "Come back in" },
    tl: { title: "daily", claimed: "Daily na-claim", cooldown: "Maaga ka pa", wallet: "Bagong Balanse", earned: "Kinita", streak: "Streak", streakBonus: "Streak Bonus", wait: "Bumalik sa loob ng" },
    ko: { title: "일일 보상", claimed: "일일 보상 획득", cooldown: "아직 쿨타임 중", wallet: "현재 잔액", earned: "획득", streak: "연속", streakBonus: "연속 보너스", wait: "다시 오세요:" },
    ja: { title: "デイリー", claimed: "デイリー報酬獲得", cooldown: "まだクールダウン中", wallet: "現在の残高", earned: "獲得", streak: "連続", streakBonus: "連続ボーナス", wait: "後で戻ってください:" },
};

const QUIPS = [
    "Humans love free money. Fascinating.",
    "Daily claimed. Economy slightly less terrible.",
    "You showed up. That's more than most.",
    "Free coins acquired. Spend them wisely. (You won't.)",
    "Another day, another donation from Angela.",
    "Claim logged. Your grind is noted.",
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("✦ Claim your daily coins + XP reward"),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t    = LOCAL[lang] || LOCAL.en;
        const u    = getUser(interaction.guildId, interaction.user.id);
        const cd   = cooldownLeft(u.lastDaily, "daily");

        if (cd > 0) {
            return interaction.reply({ embeds: [
                new EmbedBuilder().setColor("#FF6B6B")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("⏳ Too soon.")
                    .setDescription(`${t.wait} **${formatCooldown(cd)}**\n> Come back when you have more patience. 🙄`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ daily · angela" })
            ], ephemeral: true });
        }

        const base       = Math.floor(Math.random() * 301) + 200;
        const now        = Date.now();
        const wasYesterday = (now - u.lastDaily) < 172800000 && u.lastDaily > 0;
        const newStreak  = wasYesterday ? (u.dailyStreak || 0) + 1 : 1;
        const streakBonus = Math.min(newStreak * 25, 250);
        const total      = base + streakBonus;
        const { leveled, newLevel } = addXP(interaction.guildId, interaction.user.id, 50);

        updateUser(interaction.guildId, interaction.user.id, u => {
            u.coins      += total;
            u.lastDaily  = now;
            u.dailyStreak = newStreak;
        });

        const refreshed = getUser(interaction.guildId, interaction.user.id);
        const quip      = QUIPS[Math.floor(Math.random() * QUIPS.length)];

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`💰 ${t.claimed}`)
            .setDescription(`*"${quip}"*`)
            .addFields(
                { name: `✨ ${t.earned}`, value: `\`+${total} coins\` (+50 XP)`, inline: true },
                { name: `🔥 ${t.streak}`, value: `\`${newStreak} days\``, inline: true },
                { name: `🎁 ${t.streakBonus}`, value: `\`+${streakBonus} coins\``, inline: true },
                { name: `👛 ${t.wallet}`, value: `\`${refreshed.coins.toLocaleString()} coins\``, inline: true },
            )
            .setFooter({ text: leveled ? `⬆️ LEVEL UP! You are now Lv. ${newLevel}` : "˚ʚ♡ɞ˚ daily · angela" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t    = LOCAL[lang] || LOCAL.en;
        const u    = getUser(message.guildId, message.author.id);
        const cd   = cooldownLeft(u.lastDaily, "daily");

        if (cd > 0) return message.reply(`⏳ **${t.wait}** \`${formatCooldown(cd)}\``);

        const base      = Math.floor(Math.random() * 301) + 200;
        const now       = Date.now();
        const wasYest   = (now - u.lastDaily) < 172800000 && u.lastDaily > 0;
        const newStreak = wasYest ? (u.dailyStreak || 0) + 1 : 1;
        const streakBonus = Math.min(newStreak * 25, 250);
        const total     = base + streakBonus;
        addXP(message.guildId, message.author.id, 50);
        updateUser(message.guildId, message.author.id, u => { u.coins += total; u.lastDaily = now; u.dailyStreak = newStreak; });

        message.reply(`💰 **${t.claimed}!** \`+${total} coins\` · 🔥 \`${newStreak} day streak\``);
    },
};
