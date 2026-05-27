const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "resume", noQueue: "Nothing is paused~", notPaused: "Music is already playing~", resumed: "Playback resumed." },
    tl: { title: "resume", noQueue: "Walang naka-pause~", notPaused: "Nagpapatugtog na ang musika~", resumed: "Nagpatuloy na ang tugtugin." },
    ko: { title: "재개", noQueue: "일시정지된 음악이 없어요~", notPaused: "이미 재생 중이에요~", resumed: "재생이 재개되었습니다." },
    ja: { title: "再開", noQueue: "一時停止中の音楽がありません～", notPaused: "すでに再生中です～", resumed: "再生を再開しました。" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("✦ Resume paused playback"),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });
        if (!queue.paused) return interaction.reply({ content: `▶️ ${t.notPaused}`, ephemeral: true });
        queue.resume();
        const embed = new EmbedBuilder().setColor("#c9b1ff")
            .setAuthor({ name: "angela ♡ | resume", iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`⊹ ─────────────────── ⊹\n▶️ **${t.resumed}**\n> \`${queue.songs[0]?.name ?? "—"}\`\n⊹ ─────────────────── ⊹`)
            .setFooter({ text: `˚ʚ♡ɞ˚ resume · angela · ${lang.toUpperCase()}` });
        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message.guildId);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        if (!queue.paused) return message.reply(`▶️ ${t.notPaused}`);
        queue.resume();
        message.reply(`▶️ **${t.resumed}**`);
    },
};
