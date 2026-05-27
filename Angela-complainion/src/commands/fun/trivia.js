const { SlashCommandBuilder, EmbedBuilder, Collection } = require("discord.js");

const LIFE = "<:cupcake:1455889268869435574>";

const TRANS = {
    en: { system: "trivia quest", prompt: "Type the number or the answer below.", cooldown: "Please wait {time}s before playing again~", correct: "Correct! Moving to next question...", wrong: "Incorrect! The answer was:", end: "All questions answered!" },
    tl: { system: "trivia quest", prompt: "I-type ang numero o sagot sa ibaba.", cooldown: "Maghintay ng {time}s bago maglaro ulit~", correct: "Tama! Susunod na tanong...", wrong: "Mali! Ang sagot ay:", end: "Lahat ng tanong nasagot na!" },
    ko: { system: "트리비아 퀘스트", prompt: "번호나 답을 아래에 입력하세요.", cooldown: "다시 플레이하기 전에 {time}초 기다려주세요~", correct: "정답! 다음 질문으로...", wrong: "오답! 정답은:", end: "모든 질문에 답했어요!" },
    ja: { system: "トリビアクエスト", prompt: "番号または回答を下に入力してください。", cooldown: "また遊ぶには{time}秒お待ちください～", correct: "正解！次の質問へ...", wrong: "不正解！正解は：", end: "全問回答しました！" }
};

const cooldowns = new Collection();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("trivia")
        .setDescription("✦ Neural trivia quest — 5 questions, 3 lives"),
    async execute(interaction) {
        const { user, guildId, client } = interaction;
        const lang = client.languages?.get(guildId) || "en";
        const t = TRANS[lang] || TRANS.en;
        const now = Date.now();
        const cooldownAmount = 300 * 1000;
        if (cooldowns.has(user.id)) {
            const exp = cooldowns.get(user.id) + cooldownAmount;
            if (now < exp) {
                const left = Math.round((exp - now) / 1000);
                return interaction.reply({ content: `🎀 ${t.cooldown.replace("{time}", left)}`, ephemeral: true });
            }
        }
        cooldowns.set(user.id, now);
        setTimeout(() => cooldowns.delete(user.id), cooldownAmount);
        return runInquiry(interaction, 1, 5, 3, t, lang);
    }
};

async function runInquiry(interaction, progress, maxSteps, hearts, t, lang) {
    try {
        const res = await fetch(`https://opentdb.com/api.php?amount=1&type=multiple&difficulty=medium&seed=${Date.now() + progress}`);
        const data = await res.json();
        if (!data.results?.length) throw new Error("No data");
        const node = data.results[0];
        const clean = s => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"');
        const question = clean(node.question);
        const correctAnswer = clean(node.correct_answer);
        const choices = [...node.incorrect_answers.map(clean), correctAnswer].sort(() => Math.random() - 0.5);
        const livesBar = LIFE.repeat(hearts) + "💔".repeat(3 - hearts);
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.system} — node ${progress}/${maxSteps}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `❓ **Question ${progress}**\n> ${question}\n\n` +
                `${livesBar}\n\n` +
                `*${t.prompt}*\n` +
                `⊹ ─────────────────── ⊹`
            )
            .addFields({ name: "✨ Choices", value: choices.map((c, i) => `\`[ ${i + 1} ]\` ${c}`).join("\n") })
            .setFooter({ text: `˚ʚ♡ɞ˚ trivia · angela · ${lang.toUpperCase()}` });
        if (progress === 1) await interaction.reply({ embeds: [embed] });
        else await interaction.editReply({ embeds: [embed] });
        const collector = interaction.channel.createMessageCollector({ filter: m => m.author.id === interaction.user.id, time: 30000, max: 1 });
        collector.on("collect", async m => {
            if (m.deletable) await m.delete().catch(() => null);
            let selection = m.content.trim();
            const idx = parseInt(selection) - 1;
            if (!isNaN(idx) && choices[idx]) selection = choices[idx];
            const isCorrect = selection.toLowerCase() === correctAnswer.toLowerCase();
            if (isCorrect && progress >= maxSteps) {
                return interaction.editReply({ embeds: [new EmbedBuilder().setColor("#FFD700")
                    .setAuthor({ name: `angela ♡ | ${t.system}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setDescription(`⊹ ─────────────────── ⊹\n🌟 **${t.end}**\n> All nodes secured! You're brilliant~ ✦\n⊹ ─────────────────── ⊹`)] });
            }
            if (isCorrect) return runInquiry(interaction, progress + 1, maxSteps, hearts, t, lang);
            const remaining = hearts - 1;
            if (remaining <= 0) {
                return interaction.editReply({ embeds: [new EmbedBuilder().setColor("#9b59b6")
                    .setAuthor({ name: `angela ♡ | ${t.system}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setDescription(`⊹ ─────────────────── ⊹\n💔 **${t.wrong}** \`${correctAnswer}\`\n> Better luck next time, little star~\n⊹ ─────────────────── ⊹`)] });
            }
            return runInquiry(interaction, progress + 1, maxSteps, remaining, t, lang);
        });
        collector.on("end", (collected, reason) => {
            if (reason === "time" && collected.size === 0) {
                interaction.editReply({ content: "⏰ **Session expired.** No answer detected~", embeds: [] }).catch(() => null);
            }
        });
    } catch (err) {
        console.error(err);
        const msg = "⚠️ **Oops!** Trivia API is sleeping~ Try again in a moment.";
        if (interaction.replied || interaction.deferred) return interaction.editReply({ content: msg, embeds: [] });
        return interaction.reply({ content: msg, ephemeral: true });
    }
}
