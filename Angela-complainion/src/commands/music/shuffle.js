const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "shuffle", noQueue: "Nothing is playing~", noSongs: "Not enough songs to shuffle~", shuffled: "Queue shuffled!" },
    tl: { title: "shuffle", noQueue: "Walang nagpapatugtog~", noSongs: "Hindi sapat ang mga kanta para i-shuffle~", shuffled: "Na-shuffle na ang queue!" },
    ko: { title: "셔플", noQueue: "재생 중인 음악이 없어요~", noSongs: "셔플할 곡이 충분하지 않아요~", shuffled: "대기열이 셔플되었습니다!" },
    ja: { title: "シャッフル", noQueue: "再生中の音楽がありません～", noSongs: "シャッフルするのに十分な曲がありません～", shuffled: "キューをシャッフルしました！" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("✦ Shuffle the music queue"),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });
        if (queue.songs.length < 2) return interaction.reply({ content: `🎵 ${t.noSongs}`, ephemeral: true });
        await queue.shuffle();
        const embed = new EmbedBuilder().setColor("#c9b1ff")
            .setAuthor({ name: "angela ♡ | shuffle", iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`⊹ ─────────────────── ⊹\n🔀 **${t.shuffled}**\n> ${queue.songs.length} songs reordered~\n⊹ ─────────────────── ⊹`)
            .setFooter({ text: `˚ʚ♡ɞ˚ shuffle · angela · ${lang.toUpperCase()}` });
        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message.guildId);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        if (queue.songs.length < 2) return message.reply(`🎵 ${t.noSongs}`);
        await queue.shuffle();
        message.reply(`🔀 **${t.shuffled}**`);
    },
};
