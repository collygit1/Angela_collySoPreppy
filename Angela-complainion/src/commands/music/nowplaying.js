const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { RepeatMode } = require("distube");

const LOCAL = {
    en: { title: "now playing", noQueue: "Nothing is playing~", by: "Requested by", duration: "Duration", loop: "Loop", vol: "Volume", modes: { [RepeatMode.DISABLED]: "Off", [RepeatMode.SONG]: "🔂 Song", [RepeatMode.QUEUE]: "🔁 Queue" } },
    tl: { title: "nagpapatugtog", noQueue: "Walang nagpapatugtog~", by: "Hiniling ni", duration: "Tagal", loop: "Loop", vol: "Volume", modes: { [RepeatMode.DISABLED]: "Wala", [RepeatMode.SONG]: "🔂 Kanta", [RepeatMode.QUEUE]: "🔁 Queue" } },
    ko: { title: "현재 재생 중", noQueue: "재생 중인 음악이 없어요~", by: "요청자", duration: "길이", loop: "루프", vol: "볼륨", modes: { [RepeatMode.DISABLED]: "끄기", [RepeatMode.SONG]: "🔂 곡", [RepeatMode.QUEUE]: "🔁 대기열" } },
    ja: { title: "現在再生中", noQueue: "再生中の音楽がありません～", by: "リクエスト者", duration: "長さ", loop: "ループ", vol: "音量", modes: { [RepeatMode.DISABLED]: "オフ", [RepeatMode.SONG]: "🔂 曲", [RepeatMode.QUEUE]: "🔁 キュー" } },
};

function progressBar(current, total, length = 18) {
    if (!total || total === 0) return "▱".repeat(length);
    const pct = Math.min(current / total, 1);
    const filled = Math.round(pct * length);
    return "▰".repeat(filled) + "▱".repeat(length - filled);
}

function fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildControls(paused) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("music_skip_back").setEmoji("⏮️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(paused ? "music_resume" : "music_pause").setEmoji(paused ? "▶️" : "⏸️").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("music_skip").setEmoji("⏭️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("music_loop_cycle").setEmoji("🔁").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("music_stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger),
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("✦ Show the currently playing track"),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });

        const song = queue.songs[0];
        const current = queue.currentTime;
        const total = song.duration;
        const bar = progressBar(current, total);
        const loopLabel = t.modes[queue.repeatMode] ?? "Off";

        const embed = new EmbedBuilder()
            .setColor("#c9b1ff")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`🎵 ${song.name}`)
            .setURL(song.url)
            .setThumbnail(song.thumbnail ?? null)
            .setDescription(`\`${fmt(current)}\` ${bar} \`${fmt(total)}\``)
            .addFields(
                { name: t.by, value: `${song.member ?? song.user ?? "Unknown"}`, inline: true },
                { name: t.loop, value: loopLabel, inline: true },
                { name: t.vol, value: `${queue.volume}%`, inline: true },
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ nowplaying · angela · ${lang.toUpperCase()}` });

        await interaction.reply({ embeds: [embed], components: [buildControls(queue.paused)] });
    },

    async prefixExecute(message) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message.guildId);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        const song = queue.songs[0];
        const current = queue.currentTime;
        const total = song.duration;
        const bar = progressBar(current, total);
        const embed = new EmbedBuilder()
            .setColor("#c9b1ff")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: message.client.user.displayAvatarURL() })
            .setTitle(`🎵 ${song.name}`)
            .setURL(song.url)
            .setThumbnail(song.thumbnail ?? null)
            .setDescription(`\`${fmt(current)}\` ${bar} \`${fmt(total)}\``)
            .addFields(
                { name: t.by, value: `${song.member ?? song.user ?? "Unknown"}`, inline: true },
                { name: t.loop, value: t.modes[queue.repeatMode] ?? "Off", inline: true },
                { name: t.vol, value: `${queue.volume}%`, inline: true },
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ nowplaying · angela · ${lang.toUpperCase()}` });
        message.reply({ embeds: [embed], components: [buildControls(queue.paused)] });
    },
};
