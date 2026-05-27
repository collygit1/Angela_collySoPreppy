const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "seek", noQueue: "Nothing is playing~", seeked: "Seeked to", tooLong: "Time exceeds the song duration.", invalid: "Invalid time format. Use seconds (e.g. `90`) or `m:ss` (e.g. `1:30`)." },
    tl: { title: "seek", noQueue: "Walang nagpapatugtog~", seeked: "Lumipat sa", tooLong: "Ang oras ay mas mahaba sa kanta.", invalid: "Hindi wastong format. Gamitin ang segundos (hal. `90`) o `m:ss` (hal. `1:30`)." },
    ko: { title: "탐색", noQueue: "재생 중인 음악이 없어요~", seeked: "탐색 위치:", tooLong: "시간이 곡 길이를 초과합니다.", invalid: "잘못된 시간 형식. 초 (예: `90`) 또는 `m:ss` (예: `1:30`) 형식을 사용하세요." },
    ja: { title: "シーク", noQueue: "再生中の音楽がありません～", seeked: "シーク位置:", tooLong: "時間が曲の長さを超えています。", invalid: "無効な時間形式。秒数 (例: `90`) または `m:ss` (例: `1:30`) を使用してください。" },
};

function parseTime(input) {
    if (/^\d+$/.test(input)) return parseInt(input);
    const match = input.match(/^(\d+):(\d{1,2})$/);
    if (match) return parseInt(match[1]) * 60 + parseInt(match[2]);
    return null;
}

function fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("seek")
        .setDescription("✦ Jump to a position in the current track")
        .addStringOption(o => o.setName("time").setDescription("Time in seconds or m:ss format (e.g. 90 or 1:30)").setRequired(true)),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });
        const input = interaction.options.getString("time");
        const seconds = parseTime(input);
        if (seconds === null) return interaction.reply({ content: `🎵 ${t.invalid}`, ephemeral: true });
        if (seconds >= queue.songs[0].duration) return interaction.reply({ content: `🎵 ${t.tooLong}`, ephemeral: true });
        await queue.seek(seconds);
        const embed = new EmbedBuilder().setColor("#c9b1ff")
            .setAuthor({ name: "angela ♡ | seek", iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`⊹ ─────────────────── ⊹\n⏩ **${t.seeked}** \`${fmt(seconds)}\`\n> \`${queue.songs[0].name}\`\n⊹ ─────────────────── ⊹`)
            .setFooter({ text: `˚ʚ♡ɞ˚ seek · angela · ${lang.toUpperCase()}` });
        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message.guildId);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        const seconds = parseTime(args[0] || "");
        if (seconds === null) return message.reply(`🎵 ${t.invalid}`);
        if (seconds >= queue.songs[0].duration) return message.reply(`🎵 ${t.tooLong}`);
        await queue.seek(seconds);
        message.reply(`⏩ **${t.seeked}** \`${fmt(seconds)}\``);
    },
};
