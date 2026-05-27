const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "rate", subject: "Subject", score: "Score", grade: "Grade", proc: "Analyzing...",
        grades: ["🥀 Terrible", "😔 Below Average", "😐 Average", "✨ Above Average", "🌟 Excellent!", "🌸 Perfect~"] },
    tl: { title: "rate", subject: "Paksa", score: "Marka", grade: "Grado", proc: "Sinusuri...",
        grades: ["🥀 Terrible", "😔 Medyo Pangit", "😐 Average", "✨ Above Average", "🌟 Mahusay!", "🌸 Perpekto~"] },
    ko: { title: "평가", subject: "대상", score: "점수", grade: "등급", proc: "분석 중...",
        grades: ["🥀 최악", "😔 평균 이하", "😐 평균", "✨ 평균 이상", "🌟 훌륭해요!", "🌸 완벽해요~"] },
    ja: { title: "評価", subject: "対象", score: "スコア", grade: "グレード", proc: "分析中...",
        grades: ["🥀 最悪", "😔 平均以下", "😐 普通", "✨ 平均以上", "🌟 素晴らしい！", "🌸 完璧~"] }
};

module.exports = {
    name: "rate",
    data: new SlashCommandBuilder()
        .setName("rate")
        .setDescription("✦ Rate anything with stars~")
        .addStringOption(o => o.setName("subject").setDescription("What to rate").setRequired(true)),
    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const subject = interaction.options.getString("subject");
        const initEmbed = new EmbedBuilder().setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`⭐ *${t.proc}*\n> **${t.subject}:** ${subject}`);
        await interaction.reply({ embeds: [initEmbed] });
        await new Promise(r => setTimeout(r, 1200));
        await this.reveal(interaction, interaction.user, subject, t, lang, true);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const subject = args.join(" ");
        if (!subject) return message.reply("🎀 Provide something to rate!");
        await this.reveal(message, message.author, subject, t, lang, false);
    },
    async reveal(ctx, user, subject, t, lang, edit) {
        const score = (Math.random() * 10).toFixed(1);
        const stars = "⭐".repeat(Math.round(score / 2)) + "☆".repeat(5 - Math.round(score / 2));
        const gradeIdx = Math.min(Math.floor(parseFloat(score) / 2), 5);
        const grade = t.grades[gradeIdx];
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `⭐ **${t.subject}:** \`${subject}\`\n\n` +
                `${stars}\n` +
                `✨ **${t.score}:** \`${score}/10\`\n` +
                `🎀 **${t.grade}:** \`${grade}\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ rate · angela · ${lang.toUpperCase()}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();
        if (edit) return ctx.editReply({ embeds: [embed] });
        return ctx.reply({ embeds: [embed] });
    }
};
