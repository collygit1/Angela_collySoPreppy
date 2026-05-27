const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "joke", setup: "Setup", punchline: "Punchline ✨", error: "Angela's joke circuit short-circuited~ Try again!" },
    tl: { title: "joke", setup: "Panimula", punchline: "Punchline ✨", error: "Nag-short circuit ang joke module ni Angela~ Subukan ulit!" },
    ko: { title: "농담", setup: "설정", punchline: "펀치라인 ✨", error: "Angela의 농담 회로가 단락됐어요~ 다시 시도해 주세요!" },
    ja: { title: "ジョーク", setup: "セットアップ", punchline: "オチ ✨", error: "Angelaのジョーク回路がショートしました~ もう一度試してください！" },
};

const BUILTIN_JOKES = [
    { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
    { setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field!" },
    { setup: "I'm reading a book about anti-gravity.", punchline: "It's impossible to put down!" },
    { setup: "Did you hear about the mathematician who's afraid of negative numbers?", punchline: "He'll stop at nothing to avoid them!" },
    { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs!" },
    { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
    { setup: "How do you organize a space party?", punchline: "You planet!" },
    { setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired!" },
    { setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese!" },
    { setup: "Why can't you give Elsa a balloon?", punchline: "Because she'll let it go!" },
];

module.exports = {
    name: "joke",
    data: new SlashCommandBuilder()
        .setName("joke")
        .setDescription("✦ Get a random joke from Angela~"),

    async execute(interaction) {
        await interaction.deferReply();
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        await this.deliver(interaction, t, true);
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        await this.deliver(message, t, false);
    },

    async deliver(ctx, t, isSlash) {
        let setup, punchline;

        try {
            const res = await fetch("https://official-joke-api.appspot.com/random_joke");
            if (res.ok) {
                const data = await res.json();
                setup = data.setup;
                punchline = data.punchline;
            }
        } catch {}

        if (!setup) {
            const pick = BUILTIN_JOKES[Math.floor(Math.random() * BUILTIN_JOKES.length)];
            setup = pick.setup;
            punchline = pick.punchline;
        }

        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .addFields(
                { name: `😏 ${t.setup}`, value: setup, inline: false },
                { name: `😂 ${t.punchline}`, value: punchline, inline: false }
            )
            .setTimestamp();

        if (isSlash) await ctx.editReply({ embeds: [embed] });
        else await ctx.reply({ embeds: [embed] });
    },
};
