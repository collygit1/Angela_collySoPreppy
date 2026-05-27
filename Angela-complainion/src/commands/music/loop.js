const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { RepeatMode } = require("distube");

const MODES = {
    off:   RepeatMode.DISABLED,
    song:  RepeatMode.SONG,
    queue: RepeatMode.QUEUE,
};

const LOCAL = {
    en: { title: "loop", noQueue: "Nothing is playing~", set: "Loop mode set to", modes: { off: "Off", song: "Song", queue: "Queue" } },
    tl: { title: "loop", noQueue: "Walang nagpapatugtog~", set: "Loop mode naka-set sa", modes: { off: "Wala", song: "Kanta", queue: "Queue" } },
    ko: { title: "루프", noQueue: "재생 중인 음악이 없어요~", set: "루프 모드 설정됨:", modes: { off: "끄기", song: "곡", queue: "대기열" } },
    ja: { title: "ループ", noQueue: "再生中の音楽がありません～", set: "ループモード設定済み:", modes: { off: "オフ", song: "曲", queue: "キュー" } },
};

const ICONS = { off: "🔕", song: "🔂", queue: "🔁" };

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("✦ Set loop mode for the queue")
        .addStringOption(o =>
            o.setName("mode").setDescription("Loop mode").setRequired(true)
             .addChoices(
                { name: "Off", value: "off" },
                { name: "Song (repeat current)", value: "song" },
                { name: "Queue (repeat all)", value: "queue" },
             )
        ),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });
        const mode = interaction.options.getString("mode");
        queue.setRepeatMode(MODES[mode]);
        const icon = ICONS[mode];
        const label = t.modes[mode];
        const embed = new EmbedBuilder().setColor("#c9b1ff")
            .setAuthor({ name: "angela ♡ | loop", iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`⊹ ─────────────────── ⊹\n${icon} **${t.set}** \`${label}\`\n⊹ ─────────────────── ⊹`)
            .setFooter({ text: `˚ʚ♡ɞ˚ loop · angela · ${lang.toUpperCase()}` });
        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message.guildId);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        const mode = args[0]?.toLowerCase();
        if (!MODES.hasOwnProperty(mode)) return message.reply("🎵 Modes: `off`, `song`, `queue`");
        queue.setRepeatMode(MODES[mode]);
        message.reply(`${ICONS[mode]} **${t.set}** \`${t.modes[mode]}\``);
    },
};
