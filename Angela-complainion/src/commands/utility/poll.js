const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "poll", question: "Question", options: "Options", vote: "Vote with the reactions below~", ends: "Poll ends", noOpts: "Provide at least 2 options (comma-separated).", tooMany: "Maximum 9 options allowed." },
    tl: { title: "poll", question: "Tanong", options: "Mga Pagpipilian", vote: "Bumoto gamit ang mga reaction sa ibaba~", ends: "Magtatapos ang poll", noOpts: "Magbigay ng kahit 2 na pagpipilian (hiwalay ng kuwit).", tooMany: "Maximum na 9 na pagpipilian lamang." },
    ko: { title: "투표", question: "질문", options: "선택지", vote: "아래 반응으로 투표해 주세요~", ends: "투표 종료", noOpts: "최소 2개의 선택지를 쉼표로 구분하여 입력하세요.", tooMany: "최대 9개의 선택지만 허용됩니다." },
    ja: { title: "投票", question: "質問", options: "選択肢", vote: "下のリアクションで投票してください～", ends: "投票終了", noOpts: "少なくとも2つの選択肢をカンマで区切って入力してください。", tooMany: "最大9つの選択肢まで許可されています。" },
};

const NUMBER_EMOJIS = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];
const YES_NO = ["✅","❌"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("✦ Create a poll with up to 9 options")
        .addStringOption(o => o.setName("question").setDescription("The poll question").setRequired(true))
        .addStringOption(o => o.setName("options").setDescription("Options separated by commas (leave blank for yes/no)"))
        .addIntegerOption(o => o.setName("duration").setDescription("Duration in minutes (optional, max 1440)").setMinValue(1).setMaxValue(1440)),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const question = interaction.options.getString("question");
        const rawOpts  = interaction.options.getString("options");
        const duration = interaction.options.getInteger("duration");

        let opts = rawOpts ? rawOpts.split(",").map(o => o.trim()).filter(Boolean) : [];

        if (opts.length === 1) return interaction.reply({ content: `❌ ${t.noOpts}`, ephemeral: true });
        if (opts.length > 9)  return interaction.reply({ content: `❌ ${t.tooMany}`, ephemeral: true });

        const isYesNo = opts.length === 0;
        const emojis  = isYesNo ? YES_NO : NUMBER_EMOJIS.slice(0, opts.length);

        let desc = isYesNo
            ? `> ✅ Yes\n> ❌ No`
            : opts.map((o, i) => `> ${emojis[i]} ${o}`).join("\n");

        if (duration) {
            const endsAt = Math.floor((Date.now() + duration * 60000) / 1000);
            desc += `\n\n⏱️ ${t.ends}: <t:${endsAt}:R>`;
        }

        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(`📊 ${question}`)
            .setDescription(desc)
            .setFooter({ text: `${t.vote} · ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        const msg = await interaction.fetchReply();
        for (const emoji of emojis) await msg.react(emoji).catch(() => {});
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        if (!args.length) return message.reply(`❌ Usage: \`poll <question> | option1, option2, ...\``);

        const [questionPart, optPart] = args.join(" ").split("|");
        const question = questionPart?.trim();
        const opts = optPart ? optPart.split(",").map(o => o.trim()).filter(Boolean) : [];

        if (!question) return message.reply(`❌ Provide a question!`);
        if (opts.length === 1) return message.reply(`❌ ${t.noOpts}`);
        if (opts.length > 9)  return message.reply(`❌ ${t.tooMany}`);

        const isYesNo = opts.length === 0;
        const emojis  = isYesNo ? YES_NO : NUMBER_EMOJIS.slice(0, opts.length);
        const desc = isYesNo ? `> ✅ Yes\n> ❌ No` : opts.map((o, i) => `> ${emojis[i]} ${o}`).join("\n");

        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: message.client.user.displayAvatarURL() })
            .setTitle(`📊 ${question}`)
            .setDescription(desc)
            .setFooter({ text: `${t.vote} · ${message.author.tag}` })
            .setTimestamp();

        const msg = await message.reply({ embeds: [embed] });
        for (const emoji of emojis) await msg.react(emoji).catch(() => {});
    },
};
