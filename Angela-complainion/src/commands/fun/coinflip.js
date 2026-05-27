const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "coinflip", heads: "✦ HEADS ✦", tails: "✦ TAILS ✦", result: "Result", bias: "Probability Bias", proc: "Observing quantum state..." },
    tl: { title: "coinflip", heads: "✦ TAO ✦", tails: "✦ IBON ✦", result: "Resulta", bias: "Probability Bias", proc: "Sinisiyasat ang quantum state..." },
    ko: { title: "동전 던지기", heads: "✦ 앞면 ✦", tails: "✦ 뒷면 ✦", result: "결과", bias: "확률 편향", proc: "양자 상태 관측 중..." },
    ja: { title: "コインフリップ", heads: "✦ 表 ✦", tails: "✦ 裏 ✦", result: "結果", bias: "確率バイアス", proc: "量子状態を観測中..." }
};

module.exports = {
    name: "coinflip",
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("✦ Flip a quantum coin"),
    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const initEmbed = new EmbedBuilder().setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`🪙 *${t.proc}*\n> **[ ◌ ◌ ◌ ◌ ◌ ]**`);
        await interaction.reply({ embeds: [initEmbed] });
        await new Promise(r => setTimeout(r, 1200));
        await this.reveal(interaction, interaction.user, t, lang, true);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        await this.reveal(message, message.author, t, lang, false);
    },
    async reveal(ctx, user, t, lang, edit) {
        const isHeads = Math.random() > 0.5;
        const chance = (Math.random() * (50.5 - 49.5) + 49.5).toFixed(4);
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `🪙 **${t.result}**\n## ${isHeads ? t.heads : t.tails}\n\n` +
                `🍬 **${t.bias}:** \`${chance}%\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ coinflip · angela · ${lang.toUpperCase()}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();
        if (edit) return ctx.editReply({ embeds: [embed] });
        return ctx.reply({ embeds: [embed] });
    }
};
