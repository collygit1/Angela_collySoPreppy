const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "aesthetic", desc: "Text re-encoded into vaporwave frequency~", result: "Output", notext: "Provide some text to convert!" },
    tl: { title: "aesthetic", desc: "Ang text ay na-convert sa vaporwave frequency~", result: "Resulta", notext: "Magbigay ng text para i-convert!" },
    ko: { title: "에스테틱", desc: "텍스트가 베이퍼웨이브 주파수로 변환되었어요~", result: "결과", notext: "변환할 텍스트를 입력해 주세요!" },
    ja: { title: "エスセティック", desc: "テキストがヴェイパーウェイブ周波数に変換されました～", result: "結果", notext: "変換するテキストを入力してください！" }
};

module.exports = {
    name: "aesthetic",
    data: new SlashCommandBuilder()
        .setName("aesthetic")
        .setDescription("✦ Convert text to vaporwave style")
        .addStringOption(o => o.setName("text").setDescription("Text to convert").setRequired(true)),
    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const input = interaction.options.getString("text");
        await this.deliver(interaction, input, interaction.user, t, lang);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const input = args.join(" ");
        if (!input) return message.reply(`🎀 ${t.notext}`);
        await this.deliver(message, input, message.author, t, lang);
    },
    async deliver(ctx, input, user, t, lang) {
        const aesthetic = input.split("").map(char => {
            const code = char.charCodeAt(0);
            return (code >= 33 && code <= 126) ? String.fromCharCode(code + 65248) : char;
        }).join("");
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `🌸 ${t.desc}\n\n` +
                `✨ **${t.result}**\n\`\`\`\n${aesthetic}\n\`\`\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ aesthetic · angela · ${lang.toUpperCase()}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();
        if (ctx.replied || ctx.deferred) return ctx.editReply({ embeds: [embed] });
        return ctx.reply({ embeds: [embed] });
    }
};
