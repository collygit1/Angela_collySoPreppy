const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "stop", noQueue: "Nothing is playing~", stopped: "Music stopped. Angela has disconnected from the voice channel." },
    tl: { title: "stop", noQueue: "Walang nagpapatugtog~", stopped: "Inihinto na ang musika. Umalis na si Angela." },
    ko: { title: "정지", noQueue: "재생 중인 음악이 없어요~", stopped: "음악 정지됨. Angela가 음성 채널에서 나갔습니다." },
    ja: { title: "停止", noQueue: "再生中の音楽がありません～", stopped: "音楽を停止しました。Angelaが音声チャンネルを離れました。" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("✦ Stop music and leave the voice channel"),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction);
        if (!queue) return interaction.reply({ content: `🎵 ${t.noQueue}`, ephemeral: true });
        queue.stop();
        const embed = new EmbedBuilder().setColor("#c9b1ff")
            .setAuthor({ name: "angela ♡ | stop", iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`⊹ ─────────────────── ⊹\n⏹️ ${t.stopped}\n⊹ ─────────────────── ⊹`)
            .setFooter({ text: `˚ʚ♡ɞ˚ stop · angela · ${lang.toUpperCase()}` });
        interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message);
        if (!queue) return message.reply(`🎵 ${t.noQueue}`);
        queue.stop();
        message.reply(`⏹️ ${t.stopped}`);
    }
};
