const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "skip", noQueue: "No music is playing~", skipped: "Track skipped! Loading next song...", noMore: "No more tracks in queue." },
    tl: { title: "skip", noQueue: "Walang musika na nagpapatugtog~", skipped: "Track na-skip! Naglo-load ng susunod...", noMore: "Walang track na natitira." },
    ko: { title: "스킵", noQueue: "재생 중인 음악이 없어요~", skipped: "트랙 스킵됨! 다음 곡 로딩 중...", noMore: "대기열에 트랙이 없습니다." },
    ja: { title: "スキップ", noQueue: "再生中の音楽がありません～", skipped: "トラックスキップ！次の曲を読み込み中...", noMore: "キューにトラックがありません。" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("✦ Skip to the next track"),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });
        try {
            await queue.skip();
            const embed = new EmbedBuilder().setColor("#c9b1ff")
                .setAuthor({ name: "angela ♡ | skip", iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(`⊹ ─────────────────── ⊹\n⏭️ ${t.skipped}\n⊹ ─────────────────── ⊹`)
                .setFooter({ text: `˚ʚ♡ɞ˚ skip · angela · ${lang.toUpperCase()}` });
            interaction.reply({ embeds: [embed] });
        } catch (e) {
            interaction.reply({ content: `🎵 ${t.noMore}`, ephemeral: true });
        }
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        try {
            await queue.skip();
            message.reply(`⏭️ ${t.skipped}`);
        } catch (e) {
            message.reply(`🎵 ${t.noMore}`);
        }
    }
};
