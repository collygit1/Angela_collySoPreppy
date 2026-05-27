const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "dice roll", sides: "Die Geometry", result: "Resulting Value", energy: "Energy State", stable: "Stable", critical: "CRITICAL!", proc: "Simulating roll..." },
    tl: { title: "dice roll", sides: "Bilang ng Sides", result: "Resulta", energy: "Energy State", stable: "Stable", critical: "CRITICAL HIT!", proc: "Sinisimula ang roll..." },
    ko: { title: "주사위", sides: "주사위 면", result: "결과", energy: "에너지 상태", stable: "안정", critical: "크리티컬!", proc: "굴리는 중..." },
    ja: { title: "サイコロ", sides: "面数", result: "結果", energy: "エネルギー状態", stable: "安定", critical: "クリティカル！", proc: "ロール中..." }
};

module.exports = {
    name: "dice",
    data: new SlashCommandBuilder()
        .setName("dice")
        .setDescription("✦ Roll a dice with quantum precision")
        .addIntegerOption(o => o.setName("sides").setDescription("Number of sides (Default: 6)").setMinValue(2).setMaxValue(100)),
    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const sides = interaction.options.getInteger("sides") || 6;
        const initEmbed = new EmbedBuilder().setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`🎲 *${t.proc}*\n> **[ 🎲 · · · ]**`);
        await interaction.reply({ embeds: [initEmbed] });
        await new Promise(r => setTimeout(r, 1200));
        await this.reveal(interaction, interaction.user, sides, t, lang, true);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const sides = parseInt(args[0]) || 6;
        if (sides < 2 || sides > 100) return message.reply("🎀 Sides must be between 2 and 100!");
        await this.reveal(message, message.author, sides, t, lang, false);
    },
    async reveal(ctx, user, sides, t, lang, edit) {
        const roll = Math.floor(Math.random() * sides) + 1;
        const isMax = roll === sides;
        const embed = new EmbedBuilder()
            .setColor(isMax ? "#FFD700" : "#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `🎲 **${t.result}**\n## ✧ [ ${roll} ] ✧\n\n` +
                `🎀 **${t.sides}:** \`d${sides}\` · ⚡ **${t.energy}:** \`${isMax ? t.critical : t.stable}\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ dice · angela · ${lang.toUpperCase()}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();
        if (edit) return ctx.editReply({ embeds: [embed] });
        return ctx.reply({ embeds: [embed] });
    }
};
