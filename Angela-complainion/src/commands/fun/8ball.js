const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "oracle", question: "Your Question", answer: "Oracle's Answer", luck: "Fortune Index", noq: "Ask a question, little star~",
        answers: ["꒰ Yes, absolutely! ꒱","꒰ Without a doubt~ ꒱","꒰ It is certain ꒱","꒰ Most likely ꒱","꒰ Perhaps... ꒱","꒰ Ask again later ꒱","꒰ Hard to say ꒱","꒰ Unlikely... ꒱","꒰ No, sorry ꒱"] },
    tl: { title: "orakulo", question: "Iyong Tanong", answer: "Sagot ng Orakulo", luck: "Indeks ng Swerte", noq: "Magtanong ka muna, munting bituin~",
        answers: ["꒰ Oo, sigurado! ꒱","꒰ Walang duda~ ꒱","꒰ Tiyak ꒱","꒰ Malamang ꒱","꒰ Marahil... ꒱","꒰ Tanungin ulit ꒱","꒰ Mahirap sabihin ꒱","꒰ Malabo... ꒱","꒰ Hindi, sorry ꒱"] },
    ko: { title: "오라클", question: "당신의 질문", answer: "오라클의 답변", luck: "운세 지수", noq: "질문해 주세요, 작은 별~",
        answers: ["꒰ 네, 확실해요! ꒱","꒰ 의심할 여지 없이~ ꒱","꒰ 분명합니다 ꒱","꒰ 아마도요 ꒱","꒰ 아마... ꒱","꒰ 나중에 물어봐요 ꒱","꒰ 말하기 어렵네요 ꒱","꒰ 가능성 낮아요... ꒱","꒰ 아니요, 미안해요 ꒱"] },
    ja: { title: "オラクル", question: "あなたの質問", answer: "オラクルの答え", luck: "運勢指数", noq: "質問してください、小さな星～",
        answers: ["꒰ はい、絶対に！ ꒱","꒰ 疑う余地なし～ ꒱","꒰ 確かです ꒱","꒰ おそらく ꒱","꒰ たぶん... ꒱","꒰ 後でまた聞いて ꒱","꒰ 難しいですね ꒱","꒰ 可能性低い... ꒱","꒰ いいえ、ごめんなさい ꒱"] }
};

module.exports = {
    name: "8ball",
    data: new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("✦ Consult Angela's oracle for answers")
        .addStringOption(o => o.setName("question").setDescription("What do you wish to know?").setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        await this.deliver(interaction, interaction.options.getString("question"), interaction.user);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const question = args.join(" ");
        if (!question) return message.reply(`🎀 ${(LOCAL[lang] || LOCAL.en).noq}`);
        await this.deliver(message, question, message.author);
    },
    async deliver(ctx, question, user) {
        const lang = ctx.client.languages?.get(ctx.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const answer = t.answers[Math.floor(Math.random() * t.answers.length)];
        const luck = Math.floor(Math.random() * 100);
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `🔮 **${t.question}**\n> *${question}*\n\n` +
                `✨ **${t.answer}**\n> **${answer}**\n` +
                `⊹ ─────────────────── ⊹\n\n` +
                `🍬 **${t.luck}:** \`${luck}%\``
            )
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `˚ʚ♡ɞ˚ oracle · angela · ${lang.toUpperCase()}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();
        if (ctx.editReply) return ctx.editReply({ embeds: [embed] });
        return ctx.reply({ embeds: [embed] });
    }
};
