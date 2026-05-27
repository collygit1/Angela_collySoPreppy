const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "lyrics", noQueue: "Nothing is playing — provide a song name!", searching: "Searching lyrics for", notFound: "No lyrics found for", error: "Could not fetch lyrics right now~" },
    tl: { title: "lyrics", noQueue: "Walang nagpapatugtog — magbigay ng pangalan ng kanta!", searching: "Hinahanap ang lyrics para sa", notFound: "Walang nahanap na lyrics para sa", error: "Hindi makuha ang lyrics ngayon~" },
    ko: { title: "가사", noQueue: "재생 중인 음악이 없어요 — 곡 이름을 입력하세요!", searching: "가사 검색 중:", notFound: "가사 없음:", error: "지금 가사를 가져올 수 없습니다~" },
    ja: { title: "歌詞", noQueue: "再生中の音楽がありません — 曲名を入力してください！", searching: "歌詞を検索中:", notFound: "歌詞が見つかりません:", error: "現在歌詞を取得できません～" },
};

async function fetchLyrics(query) {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://api.lyrics.ovh/v1/${encoded.replace(/%20/g, "/")}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data.lyrics?.trim() || null;
}

async function searchAndFetch(query) {
    const parts = query.split(" ");
    for (let i = 1; i < parts.length; i++) {
        const artist = parts.slice(0, i).join(" ");
        const title = parts.slice(i).join(" ");
        try {
            const result = await fetchLyrics(`${artist}/${title}`);
            if (result) return result;
        } catch {}
    }
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lyrics")
        .setDescription("✦ Get lyrics for the current or specified song")
        .addStringOption(o => o.setName("song").setDescription("Song name (defaults to currently playing)")),

    async execute(interaction) {
        await interaction.deferReply();
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        const query = interaction.options.getString("song") || queue?.songs[0]?.name;

        if (!query) return interaction.editReply({ content: `🎵 ${t.noQueue}` });

        try {
            const lyrics = await searchAndFetch(query);
            if (!lyrics) {
                return interaction.editReply({ embeds: [
                    new EmbedBuilder().setColor("#c9b1ff")
                        .setAuthor({ name: "angela ♡ | lyrics", iconURL: interaction.client.user.displayAvatarURL() })
                        .setDescription(`🎵 ${t.notFound} \`${query}\`~`)
                ]});
            }

            const chunks = lyrics.match(/[\s\S]{1,3800}/g) || [lyrics];
            const embed = new EmbedBuilder()
                .setColor("#c9b1ff")
                .setAuthor({ name: "angela ♡ | lyrics", iconURL: interaction.client.user.displayAvatarURL() })
                .setTitle(`🎶 ${query}`)
                .setDescription(chunks[0])
                .setFooter({ text: `˚ʚ♡ɞ˚ lyrics · angela · ${lang.toUpperCase()}` });

            await interaction.editReply({ embeds: [embed] });

            for (let i = 1; i < Math.min(chunks.length, 3); i++) {
                await interaction.followUp({ embeds: [
                    new EmbedBuilder().setColor("#c9b1ff").setDescription(chunks[i])
                ]});
            }
        } catch {
            await interaction.editReply({ content: `❌ ${t.error}` });
        }
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const queue = message.client.distube.getQueue(message.guildId);
        const query = args.join(" ") || queue?.songs[0]?.name;
        if (!query) return message.reply(`🎵 ${t.noQueue}`);
        const msg = await message.reply(`🔍 ${t.searching} \`${query}\`...`);
        try {
            const lyrics = await searchAndFetch(query);
            if (!lyrics) return msg.edit(`🎵 ${t.notFound} \`${query}\``);
            const chunks = lyrics.match(/[\s\S]{1,1900}/g) || [lyrics];
            await msg.edit(`\`\`\`\n${chunks[0]}\n\`\`\``);
            for (let i = 1; i < Math.min(chunks.length, 3); i++) await message.channel.send(`\`\`\`\n${chunks[i]}\n\`\`\``);
        } catch {
            msg.edit(`❌ ${t.error}`);
        }
    },
};
