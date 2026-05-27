const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const path = require("node:path");
const { fetchGif } = require(path.join(process.cwd(), "src", "utils", "giphy"));

const LOCAL = {
    en: { title: "slap", header: "Kinetic Transmission!", force: "Impact Force", delivered: "Slap delivered~",
        statuses: ["Impact detected! Administering physical correction.", "Kinetic energy released. Target re-aligned ✦", "Forceful interaction recorded~"] },
    tl: { title: "sampal", header: "Kinetic Transmission!", force: "Lakas ng Sampal", delivered: "Sampal naipadala~",
        statuses: ["Impact na-detect! Nagbibigay ng physical correction.", "Kinetic energy pinakawalan. Target re-aligned ✦", "Malakas na interaction naitala~"] },
    ko: { title: "뺨 때리기", header: "운동 전송!", force: "충격 세기", delivered: "뺨 때리기 전달됨~",
        statuses: ["충격 감지! 물리적 교정 실시 중.", "운동 에너지 방출. 타겟 재정렬 ✦", "강력한 상호작용이 기록됨~"] },
    ja: { title: "ビンタ", header: "運動伝達！", force: "衝撃力", delivered: "ビンタ届きました~",
        statuses: ["衝撃を検知！物理的な修正を行っています。", "運動エネルギーを放出。ターゲット再調整 ✦", "強力な相互作用が記録されました~"] }
};

module.exports = {
    name: "slap",
    data: new SlashCommandBuilder()
        .setName("slap")
        .setDescription("✦ Slap someone!")
        .addUserOption(o => o.setName("user").setDescription("Who to slap").setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("user");
        await this.deliver(interaction, interaction.user, target, t, lang);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first();
        if (!target) return message.reply("🎀 Mention someone to slap!");
        await this.deliver(message, message.author, target, t, lang);
    },
    async deliver(ctx, sender, target, t, lang) {
        const gifUrl = await fetchGif("anime slap");
        const force = (Math.random() * (95.0 - 45.0) + 45.0).toFixed(1);
        const status = t.statuses[Math.floor(Math.random() * t.statuses.length)];
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `💥 **${t.header}**\n> ${sender} 🎀 **${target.username}**\n\n` +
                `✨ *"${status}"*\n\n` +
                `⚡ **${t.force}:** \`${force}N\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setImage(gifUrl)
            .setFooter({ text: `˚ʚ♡ɞ˚ slap · angela · ${lang.toUpperCase()}` })
            .setTimestamp();
        if (ctx.channel) {
            await ctx.channel.send({ content: `<@${target.id}>`, embeds: [embed] });
            if (ctx.editReply) return ctx.editReply({ content: `✅ **${t.delivered}**` });
        } else {
            return ctx.reply({ embeds: [embed] });
        }
    }
};
