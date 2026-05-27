const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "play", noVoice: "Join a voice channel first~", searching: "Searching for", failed: "Audio stream could not be established." },
    tl: { title: "play", noVoice: "Sumali muna sa voice channel~", searching: "Hinahanap ang", failed: "Hindi ma-establish ang audio stream." },
    ko: { title: "재생", noVoice: "먼저 음성 채널에 참가해 주세요~", searching: "검색 중:", failed: "오디오 스트림을 연결할 수 없습니다." },
    ja: { title: "再生", noVoice: "まず音声チャンネルに参加してください～", searching: "検索中:", failed: "オーディオストリームを確立できません。" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("✦ Play music from YouTube, Spotify or SoundCloud")
        .addStringOption(o => o.setName("query").setDescription("Song title or URL").setRequired(true)),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const query = interaction.options.getString("query");
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.reply({ content: `🎵 ${t.noVoice}`, ephemeral: true });
        await interaction.deferReply();
        try {
            await interaction.client.distube.play(voiceChannel, query, { member: interaction.member, textChannel: interaction.channel });
            const embed = new EmbedBuilder()
                .setColor("#c9b1ff")
                .setAuthor({ name: "angela ♡ | play", iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(`⊹ ─────────────────── ⊹\n🎵 **${t.searching}:** \`${query}\`\n> *Processing audio fragments...*\n⊹ ─────────────────── ⊹`)
                .setFooter({ text: `˚ʚ♡ɞ˚ play · angela · ${lang.toUpperCase()}` });
            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: `❌ ${t.failed}` });
        }
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const query = args.join(" ");
        if (!query) return message.reply("🎵 Provide a song name or URL!");
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply(`🎵 ${t.noVoice}`);
        try {
            await message.client.distube.play(voiceChannel, query, { member: message.member, textChannel: message.channel });
            const embed = new EmbedBuilder()
                .setColor("#c9b1ff")
                .setAuthor({ name: "angela ♡ | play", iconURL: message.client.user.displayAvatarURL() })
                .setDescription(`⊹ ─────────────────── ⊹\n🎵 **${t.searching}:** \`${query}\`\n⊹ ─────────────────── ⊹`)
                .setFooter({ text: `˚ʚ♡ɞ˚ play · angela · ${lang.toUpperCase()}` });
            message.reply({ embeds: [embed] });
        } catch (e) {
            message.reply(`❌ ${t.failed}`);
        }
    }
};
