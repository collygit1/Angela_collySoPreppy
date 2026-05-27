const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "iq scan", subject: "Subject", result: "Neural Capacity", eval: "Evaluation", proc: "Scanning cognitive patterns...",
        tiers: ["☁️ Data Fragmented", "💡 Stable Logic", "✨ High Frequency", "🚀 Quantum Mind"] },
    tl: { title: "IQ scan", subject: "Paksa", result: "Kapasidad ng Utak", eval: "Ebalwasyon", proc: "Sinusuri ang patterns ng utak...",
        tiers: ["☁️ Data Fragmented", "💡 Stable Logic", "✨ High Frequency", "🚀 Quantum Mind"] },
    ko: { title: "IQ 스캔", subject: "대상", result: "신경 용량", eval: "평가", proc: "인지 패턴 스캔 중...",
        tiers: ["☁️ 데이터 파편화", "💡 안정적 로직", "✨ 고주파 사고", "🚀 양자 마인드"] },
    ja: { title: "IQ スキャン", subject: "対象", result: "神経容量", eval: "評価", proc: "認知パターンをスキャン中...",
        tiers: ["☁️ データ断片化", "💡 安定した論理", "✨ 高周波思考", "🚀 量子マインド"] }
};

module.exports = {
    name: "iq",
    data: new SlashCommandBuilder()
        .setName("iq")
        .setDescription("✦ Analyze neural capacity")
        .addUserOption(o => o.setName("target").setDescription("User to scan")),
    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("target") || interaction.user;
        const initEmbed = new EmbedBuilder().setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`🧠 *${t.proc}*\n> **${t.subject}:** ${target.username}`);
        await interaction.reply({ embeds: [initEmbed] });
        await new Promise(r => setTimeout(r, 1500));
        await this.reveal(interaction, target, t, lang, true);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first() || message.author;
        await this.reveal(message, target, t, lang, false);
    },
    async reveal(ctx, target, t, lang, edit) {
        const iq = Math.floor(Math.random() * 151) + 50;
        let evalMsg, color = "#ffcad4";
        if (iq >= 140) { evalMsg = t.tiers[3]; color = "#FFD700"; }
        else if (iq >= 115) { evalMsg = t.tiers[2]; }
        else if (iq >= 85) { evalMsg = t.tiers[1]; }
        else { evalMsg = t.tiers[0]; color = "#9b59b6"; }
        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setThumbnail(target.displayAvatarURL({ size: 256 }))
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `🧠 **${t.subject}:** \`${target.username}\`\n\n` +
                `✨ **${t.result}:** \`${iq} IQ\`\n` +
                `🎀 **${t.eval}:** \`${evalMsg}\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ iq · angela · ${lang.toUpperCase()}`, iconURL: target.displayAvatarURL() })
            .setTimestamp();
        if (edit) return ctx.editReply({ embeds: [embed] });
        return ctx.reply({ embeds: [embed] });
    }
};
