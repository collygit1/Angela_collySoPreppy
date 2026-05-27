const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "volume", noQueue: "Nothing is playing~", set: "Volume adjusted to", low: "quiet", mid: "normal", high: "loud" },
    tl: { title: "volume", noQueue: "Walang nagpapatugtog~", set: "Volume naka-set na sa", low: "mahina", mid: "normal", high: "malakas" },
    ko: { title: "볼륨", noQueue: "재생 중인 음악이 없어요~", set: "볼륨 조정됨:", low: "낮음", mid: "보통", high: "높음" },
    ja: { title: "音量", noQueue: "再生中の音楽がありません～", set: "音量調整済み:", low: "静か", mid: "普通", high: "大きい" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("✦ Adjust music volume")
        .addIntegerOption(o => o.setName("percent").setDescription("Volume 1-100").setRequired(true).setMinValue(1).setMaxValue(100)),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const volume = interaction.options.getInteger("percent");
        const queue = interaction.client.distube.getQueue(interaction);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });
        queue.setVolume(volume);
        const level = volume <= 30 ? t.low : volume <= 70 ? t.mid : t.high;
        const bar = "▰".repeat(Math.round(volume / 10)) + "▱".repeat(10 - Math.round(volume / 10));
        const embed = new EmbedBuilder().setColor("#c9b1ff")
            .setAuthor({ name: "angela ♡ | volume", iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`⊹ ─────────────────── ⊹\n🎧 **${t.set}** \`${volume}%\`\n${bar} · \`${level}\`\n⊹ ─────────────────── ⊹`)
            .setFooter({ text: `˚ʚ♡ɞ˚ volume · angela · ${lang.toUpperCase()}` });
        interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const volume = parseInt(args[0]);
        if (isNaN(volume) || volume < 1 || volume > 100) return message.reply("🎵 Provide a volume between 1-100!");
        const queue = message.client.distube.getQueue(message);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        queue.setVolume(volume);
        message.reply(`🎧 **${t.set}** \`${volume}%\``);
    }
};
