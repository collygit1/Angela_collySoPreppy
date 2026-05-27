const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "meme", sub: "Subreddit", author: "Posted by", error: "Meme portal offline~ Try again!" },
    tl: { title: "meme", sub: "Subreddit", author: "Ni-post ni", error: "Offline ang meme portal~ Subukan ulit!" },
    ko: { title: "밈", sub: "서브레딧", author: "작성자", error: "밈 포털 오프라인~ 다시 시도해 주세요!" },
    ja: { title: "ミーム", sub: "サブレディット", author: "投稿者", error: "ミームポータルがオフラインです~ もう一度試してください！" },
};

const SUBREDDITS = ["memes", "dankmemes", "me_irl", "wholesomememes", "funnymemes"];

module.exports = {
    name: "meme",
    data: new SlashCommandBuilder()
        .setName("meme")
        .setDescription("✦ Fetch a random meme~")
        .addStringOption(o =>
            o.setName("category")
             .setDescription("Meme category")
             .addChoices(
                { name: "Random", value: "memes" },
                { name: "Dank", value: "dankmemes" },
                { name: "Wholesome", value: "wholesomememes" },
                { name: "Funny", value: "funnymemes" },
             )
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const sub = interaction.options.getString("category") || SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];
        await this.deliver(interaction, sub, t, true);
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const sub = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];
        await this.deliver(message, sub, t, false);
    },

    async deliver(ctx, sub, t, isSlash) {
        try {
            const res = await fetch(`https://www.reddit.com/r/${sub}/random.json?limit=1`, {
                headers: { "User-Agent": "Angela-Bot/2.6" }
            });

            if (!res.ok) throw new Error("Reddit API down");

            const json = await res.json();
            const post = json?.[0]?.data?.children?.[0]?.data;

            if (!post || post.over_18 || !post.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                throw new Error("No safe image post found");
            }

            const embed = new EmbedBuilder()
                .setColor("#ffcad4")
                .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
                .setTitle(post.title.slice(0, 256))
                .setImage(post.url)
                .addFields({ name: `📌 ${t.sub}`, value: `r/${sub}`, inline: true },
                           { name: `👤 ${t.author}`, value: `u/${post.author}`, inline: true },
                           { name: "⬆️ Upvotes", value: `${post.ups.toLocaleString()}`, inline: true })
                .setTimestamp();

            if (isSlash) await ctx.editReply({ embeds: [embed] });
            else await ctx.reply({ embeds: [embed] });

        } catch {
            const errMsg = { embeds: [
                new EmbedBuilder().setColor("#ff6b6b")
                    .setDescription(`❌ ${t.error}`)
            ]};
            if (isSlash) await ctx.editReply(errMsg);
            else await ctx.reply(errMsg);
        }
    },
};
