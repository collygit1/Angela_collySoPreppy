const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser, updateUser, addXP, cooldownLeft, formatCooldown, hasItem } = require("../economyStore");

const LOCAL = {
    en: { title: "work", earned: "Paycheck", job: "Job", wallet: "New Balance", wait: "Still on shift. Come back in" },
    tl: { title: "trabaho", earned: "Sweldo", job: "Trabaho", wallet: "Bagong Balanse", wait: "Nasa trabaho pa. Bumalik sa" },
    ko: { title: "일하기", earned: "급여", job: "직업", wallet: "현재 잔액", wait: "아직 일하는 중. 돌아오세요:" },
    ja: { title: "働く", earned: "給料", job: "仕事", wallet: "現在の残高", wait: "まだ仕事中。戻ってください:" },
};

const JOBS = [
    { title: "Software Engineer", emoji: "💻", range: [150, 300], quip: "Fixed a bug. Created three more. Getting paid anyway." },
    { title: "Pizza Delivery",    emoji: "🍕", range: [60, 120],  quip: "Arrived 2 minutes late. Still tipped. Miracle of the century." },
    { title: "Streamer",          emoji: "📹", range: [10, 50],   quip: "4 viewers. One was your mom. Another was a bot. Inspiring." },
    { title: "Stock Trader",      emoji: "📈", range: [50, 400],  quip: "Bought high, sold low, somehow still made money. Don't ask." },
    { title: "Barista",           emoji: "☕", range: [70, 130],  quip: "Made 47 lattes. Mispelled every name. Perfect record." },
    { title: "Security Guard",    emoji: "🛡️", range: [80, 160],  quip: "Stood at a door for 8 hours. Nobody came. Peaceful." },
    { title: "Fisherman",         emoji: "🎣", range: [40, 180],  quip: "Caught a boot. Sold it as artisan footwear. Profit." },
    { title: "Miner",             emoji: "⛏️", range: [90, 200],  quip: "Dug a hole. Found a slightly shinier rock. Called it a day." },
    { title: "Street Performer",  emoji: "🎸", range: [20, 90],   quip: "Played 3 songs. Got coins. One person clapped. You're famous." },
    { title: "Angela's Assistant",emoji: "🎀", range: [100, 250], quip: "Did whatever Angela asked. Confidential. Well-compensated." },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("✦ Work a random job to earn coins (30 min cooldown)"),

    async execute(interaction) {
        const lang   = interaction.client.languages?.get(interaction.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const u      = getUser(interaction.guildId, interaction.user.id);
        const cd     = cooldownLeft(u.lastWork, "work");

        if (cd > 0) {
            return interaction.reply({ embeds: [
                new EmbedBuilder().setColor("#FF6B6B")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("⏳ Still on the clock.")
                    .setDescription(`${t.wait} **${formatCooldown(cd)}**`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ work · angela" })
            ], ephemeral: true });
        }

        const job    = JOBS[Math.floor(Math.random() * JOBS.length)];
        const lucky  = hasItem(interaction.guildId, interaction.user.id, "lucky_charm");
        let pay      = Math.floor(Math.random() * (job.range[1] - job.range[0] + 1)) + job.range[0];
        if (lucky) pay = Math.floor(pay * 1.25);

        const { leveled, newLevel } = addXP(interaction.guildId, interaction.user.id, 30);
        updateUser(interaction.guildId, interaction.user.id, u => { u.coins += pay; u.lastWork = Date.now(); });
        const refreshed = getUser(interaction.guildId, interaction.user.id);

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`${job.emoji} ${job.title}`)
            .setDescription(`*"${job.quip}"*`)
            .addFields(
                { name: `💵 ${t.earned}`, value: `\`+${pay} coins\` (+30 XP)${lucky ? " 🍀" : ""}`, inline: true },
                { name: `👛 ${t.wallet}`, value: `\`${refreshed.coins.toLocaleString()} coins\``, inline: true },
            )
            .setFooter({ text: leveled ? `⬆️ LEVEL UP! You are now Lv. ${newLevel}` : "˚ʚ♡ɞ˚ work · angela · 30m cooldown" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t    = LOCAL[lang] || LOCAL.en;
        const u    = getUser(message.guildId, message.author.id);
        const cd   = cooldownLeft(u.lastWork, "work");

        if (cd > 0) return message.reply(`⏳ **${t.wait}** \`${formatCooldown(cd)}\``);

        const job  = JOBS[Math.floor(Math.random() * JOBS.length)];
        const pay  = Math.floor(Math.random() * (job.range[1] - job.range[0] + 1)) + job.range[0];
        addXP(message.guildId, message.author.id, 30);
        updateUser(message.guildId, message.author.id, u => { u.coins += pay; u.lastWork = Date.now(); });

        message.reply(`${job.emoji} **${job.title}** — \`+${pay} coins\` · *"${job.quip}"`);
    },
};
