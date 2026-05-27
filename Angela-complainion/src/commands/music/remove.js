const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "remove", noQueue: "Nothing is playing~", removed: "Removed from queue", notFound: "No track at that position.", cantRemove: "You cannot remove the currently playing song. Use /skip instead." },
    tl: { title: "remove", noQueue: "Walang nagpapatugtog~", removed: "Tinanggal sa queue", notFound: "Walang track sa posisyong iyon.", cantRemove: "Hindi mo matatanggal ang kasalukuyang kanta. Gamitin ang /skip." },
    ko: { title: "제거", noQueue: "재생 중인 음악이 없어요~", removed: "대기열에서 제거됨", notFound: "해당 위치에 트랙이 없습니다.", cantRemove: "현재 재생 중인 곡은 제거할 수 없습니다. /skip을 사용하세요." },
    ja: { title: "削除", noQueue: "再生中の音楽がありません～", removed: "キューから削除しました", notFound: "その位置にトラックがありません。", cantRemove: "現在再生中の曲は削除できません。/skipを使用してください。" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("✦ Remove a track from the queue by position")
        .addIntegerOption(o => o.setName("position").setDescription("Queue position (1 = first in queue, not current song)").setRequired(true).setMinValue(1)),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });

        const pos = interaction.options.getInteger("position");
        const realIndex = pos;
        const song = queue.songs[realIndex];

        if (!song) return interaction.reply({ content: `🎵 ${t.notFound}`, ephemeral: true });

        queue.songs.splice(realIndex, 1);

        const embed = new EmbedBuilder().setColor("#c9b1ff")
            .setAuthor({ name: "angela ♡ | remove", iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`⊹ ─────────────────── ⊹\n🗑️ **${t.removed}:**\n> \`${song.name}\`\n⊹ ─────────────────── ⊹`)
            .setFooter({ text: `˚ʚ♡ɞ˚ remove · angela · ${lang.toUpperCase()}` });
        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message.guildId);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        const pos = parseInt(args[0]);
        if (isNaN(pos) || pos < 1) return message.reply("🎵 Provide a valid position number.");
        const song = queue.songs[pos];
        if (!song) return message.reply(`🎵 ${t.notFound}`);
        queue.songs.splice(pos, 1);
        message.reply(`🗑️ **${t.removed}:** \`${song.name}\``);
    },
};
