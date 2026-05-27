const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "ship", header: "Compatibility Scan", analysis: "Analysis Result", match: "🍭 Sweet Match!", cold: "🧊 Cooling Down...", synergy: "✨ Pure Synergy!", nouser: "Mention someone to ship!" },
    tl: { title: "ship", header: "Pagsusuri ng Match", analysis: "Resulta ng Scan", match: "🍭 Bagay Kayo!", cold: "🧊 Malamig ang Data...", synergy: "✨ Perpektong Sync!", nouser: "Mag-mention ng isang tao!" },
    ko: { title: "쉽", header: "궁합 스캔", analysis: "분석 결과", match: "🍭 잘 어울려요!", cold: "🧊 냉각 중...", synergy: "✨ 완벽한 시너지!", nouser: "누군가를 멘션해 주세요!" },
    ja: { title: "シップ", header: "相性スキャン", analysis: "分析結果", match: "🍭 お似合いです！", cold: "🧊 冷却中...", synergy: "✨ 最高のシナジー！", nouser: "誰かをメンションしてください！" }
};

module.exports = {
    name: "ship",
    data: new SlashCommandBuilder()
        .setName("ship")
        .setDescription("✦ Check compatibility between two users")
        .addUserOption(o => o.setName("user1").setDescription("First user").setRequired(true))
        .addUserOption(o => o.setName("user2").setDescription("Second user")),
    async execute(interaction) {
        const u1 = interaction.options.getUser("user1");
        const u2 = interaction.options.getUser("user2") || interaction.user;
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        await this.deliver(interaction, u1, u2, lang);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const mentions = message.mentions.users.toJSON();
        const u1 = mentions[0];
        const u2 = mentions[1] || message.author;
        if (!u1) return message.reply(`🎀 ${t.nouser}`);
        await this.deliver(message, u1, u2, lang);
    },
    async deliver(ctx, user1, user2, lang) {
        const t = LOCAL[lang] || LOCAL.en;
        const percent = Math.floor(Math.random() * 101);
        const filled = Math.floor(percent / 10);
        const bar = "▰".repeat(filled) + "▱".repeat(10 - filled);
        let status = t.match;
        if (percent < 35) status = t.cold;
        if (percent > 85) status = t.synergy;
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `💗 **${t.header}**\n> ${user1.username} 🎀 ${user2.username}\n\n` +
                `✨ **${t.analysis}**\n` +
                `🍬 **Status:** \`${status}\`\n` +
                `📊 **Score:** \`${percent}%\` · \`[${bar}]\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ ship · angela · ${lang.toUpperCase()}` })
            .setTimestamp();
        return ctx.reply ? ctx.reply({ embeds: [embed] }) : ctx.channel.send({ embeds: [embed] });
    }
};
