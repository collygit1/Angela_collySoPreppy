const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "pause", noQueue: "Nothing is playing~", already: "Already paused~", paused: "Playback paused." },
    tl: { title: "pause", noQueue: "Walang nagpapatugtog~", already: "Naka-pause na~", paused: "Naka-pause na ang tugtugin." },
    ko: { title: "일시정지", noQueue: "재생 중인 음악이 없어요~", already: "이미 일시정지 상태예요~", paused: "재생이 일시정지되었습니다." },
    ja: { title: "一時停止", noQueue: "再生中の音楽がありません～", already: "すでに一時停止中です～", paused: "再生を一時停止しました。" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("✦ Pause the current track"),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });
        if (queue.paused) return interaction.reply({ content: `⏸️ ${t.already}`, ephemeral: true });
        queue.pause();
        const embed = new EmbedBuilder().setColor("#c9b1ff")
            .setAuthor({ name: "angela ♡ | pause", iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`⊹ ─────────────────── ⊹\n⏸️ **${t.paused}**\n> \`${queue.songs[0]?.name ?? "—"}\`\n⊹ ─────────────────── ⊹`)
            .setFooter({ text: `˚ʚ♡ɞ˚ pause · angela · ${lang.toUpperCase()}` });
        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message.guildId);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        if (queue.paused) return message.reply(`⏸️ ${t.already}`);
        queue.pause();
        message.reply(`⏸️ **${t.paused}**`);
    },
};
