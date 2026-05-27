const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "softify", result: "Kawaii Output~", style: "Soft-Type v2", proc: "Modulating linguistic frequency...", notext: "Give me some text to softify!" },
    tl: { title: "softify", result: "Kawaii Output~", style: "Soft-Type v2", proc: "Binabago ang dalas ng pananalita...", notext: "Magbigay ng text para softify-in!" },
    ko: { title: "소프티파이", result: "카와이 출력~", style: "소프트-Type v2", proc: "언어 주파수 변조 중...", notext: "변환할 텍스트를 입력해 주세요!" },
    ja: { title: "ソフティファイ", result: "カワイイ出力~", style: "ソフト-Type v2", proc: "言語周波数を変調中...", notext: "変換するテキストを入力してください！" }
};

module.exports = {
    name: "softify",
    data: new SlashCommandBuilder()
        .setName("softify")
        .setDescription("✦ Softify your text into kawaii frequency~")
        .addStringOption(o => o.setName("text").setDescription("Text to softify").setRequired(true)),
    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const text = interaction.options.getString("text");
        const initEmbed = new EmbedBuilder().setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`🎀 *${t.proc}*\n> *Applying velvet filters...*`);
        await interaction.reply({ embeds: [initEmbed] });
        await new Promise(r => setTimeout(r, 1200));
        await this.reveal(interaction, interaction.user, text, t, lang, true);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const text = args.join(" ");
        if (!text) return message.reply(`🎀 ${t.notext}`);
        await this.reveal(message, message.author, text, t, lang, false);
    },
    async reveal(ctx, user, text, t, lang, edit) {
        const soft = text
            .replace(/(?:r|l)/g, "w").replace(/(?:R|L)/g, "W")
            .replace(/n([aeiou])/g, "ny$1").replace(/N([aeiou])/g, "Ny$1")
            .replace(/ove/g, "uv").replace(/!+/g, "~! (✿◡‿◡)").replace(/\.+/g, "... 🎀");
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `🎀 **${t.result}**\n> ${soft}\n\n` +
                `✨ **Style:** \`${t.style}\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ softify · angela · ${lang.toUpperCase()}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();
        if (edit) return ctx.editReply({ embeds: [embed] });
        return ctx.reply({ embeds: [embed] });
    }
};
