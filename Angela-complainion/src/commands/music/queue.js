const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { RepeatMode } = require("distube");

const LOCAL = {
    en: { title: "queue", noQueue: "Nothing is playing~", now: "Now Playing", up: "Up Next", empty: "Queue is empty~", page: "Page", of: "of", loop: { [RepeatMode.DISABLED]: "Off", [RepeatMode.SONG]: "🔂 Song", [RepeatMode.QUEUE]: "🔁 Queue" } },
    tl: { title: "queue", noQueue: "Walang nagpapatugtog~", now: "Nagpapatugtog", up: "Susunod", empty: "Walang laman ang queue~", page: "Pahina", of: "ng", loop: { [RepeatMode.DISABLED]: "Wala", [RepeatMode.SONG]: "🔂 Kanta", [RepeatMode.QUEUE]: "🔁 Queue" } },
    ko: { title: "대기열", noQueue: "재생 중인 음악이 없어요~", now: "현재 재생 중", up: "다음 곡", empty: "대기열이 비어 있어요~", page: "페이지", of: "/", loop: { [RepeatMode.DISABLED]: "끄기", [RepeatMode.SONG]: "🔂 곡", [RepeatMode.QUEUE]: "🔁 대기열" } },
    ja: { title: "キュー", noQueue: "再生中の音楽がありません～", now: "現在再生中", up: "次の曲", empty: "キューが空です～", page: "ページ", of: "/", loop: { [RepeatMode.DISABLED]: "オフ", [RepeatMode.SONG]: "🔂 曲", [RepeatMode.QUEUE]: "🔁 キュー" } },
};

const PAGE_SIZE = 10;

function buildEmbed(queue, page, t, lang, client) {
    const songs = queue.songs;
    const current = songs[0];
    const upcoming = songs.slice(1);
    const totalPages = Math.max(1, Math.ceil(upcoming.length / PAGE_SIZE));
    page = Math.min(Math.max(1, page), totalPages);

    const slice = upcoming.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const loopLabel = t.loop[queue.repeatMode] ?? "Off";

    const embed = new EmbedBuilder()
        .setColor("#c9b1ff")
        .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: client.user.displayAvatarURL() })
        .setTitle(`🎵 ${t.title.toUpperCase()}`)
        .addFields({
            name: `▶️ ${t.now}`,
            value: `[\`${current.name}\`](${current.url}) · \`${current.formattedDuration}\`\n> *${t.up}: ${upcoming.length > 0 ? upcoming.length : 0}*`,
        });

    if (slice.length > 0) {
        embed.addFields({
            name: `📋 ${t.up}`,
            value: slice.map((s, i) => `\`${(page - 1) * PAGE_SIZE + i + 1}.\` [${s.name}](${s.url}) · \`${s.formattedDuration}\``).join("\n"),
        });
    } else {
        embed.addFields({ name: `📋 ${t.up}`, value: t.empty });
    }

    embed.setFooter({ text: `${t.page} ${page} ${t.of} ${totalPages} · 🔁 ${loopLabel} · ˚ʚ♡ɞ˚ angela · ${lang.toUpperCase()}` });
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("✦ View the current music queue")
        .addIntegerOption(o => o.setName("page").setDescription("Page number").setMinValue(1)),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });
        const page = interaction.options.getInteger("page") || 1;
        await interaction.reply({ embeds: [buildEmbed(queue, page, t, lang, interaction.client)] });
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message.guildId);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        const page = parseInt(args[0]) || 1;
        message.reply({ embeds: [buildEmbed(queue, page, t, lang, message.client)] });
    },
};
