const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const path = require("node:path");
const { fetchGif } = require(path.join(process.cwd(), "src", "utils", "giphy"));

const LOCAL = {
    en: { title: "headpat", header: "Gentle Headpat~", comfort: "Comfort Level", delivered: "Pat delivered~",
        statuses: ["Gently patting your head~ Comfort levels rising.", "Tactile comfort engaged. Target is adorable.", "Headpat sequence: Complete ♡"] },
    tl: { title: "headpat", header: "Malambot na Haplos~", comfort: "Antas ng Komportable", delivered: "Himashay naipadala~",
        statuses: ["Dahan-dahang hinahaplos ang ulo~ Komportable na.", "Tactile comfort engaged. Sobrang cute ng target.", "Headpat sequence: Tapos na ♡"] },
    ko: { title: "머리 쓰다듬기", header: "부드러운 머리 쓰다듬기~", comfort: "편안함 수준", delivered: "쓰다듬기 전달됨~",
        statuses: ["머리를 살살 쓰다듬는 중~ 편안함 상승.", "촉각 위로 가동. 타겟이 매우 귀여워요.", "쓰다듬기 시퀀스: 완료 ♡"] },
    ja: { title: "頭なで", header: "優しい頭なで～", comfort: "快適度", delivered: "なでなで届きました~",
        statuses: ["優しく頭をなでています～ 快適度が上昇中。", "触覚の快適さ：有効。ターゲットが可愛い。", "頭なでシーケンス：完了 ♡"] }
};

module.exports = {
    name: "pat",
    data: new SlashCommandBuilder()
        .setName("pat")
        .setDescription("✦ Give someone a gentle headpat~")
        .addUserOption(o => o.setName("target").setDescription("Who to pat").setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("target");
        await this.deliver(interaction, interaction.user, target, t, lang);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first();
        if (!target) return message.reply("🎀 Mention someone to pat!");
        await this.deliver(message, message.author, target, t, lang);
    },
    async deliver(ctx, sender, target, t, lang) {
        const gifUrl = await fetchGif("anime head pat");
        const comfort = Math.floor(Math.random() * 20) + 80;
        const status = t.statuses[Math.floor(Math.random() * t.statuses.length)];
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `🌟 **${t.header}**\n> ${sender} 🎀 **${target.username}**\n\n` +
                `✨ *"${status}"*\n\n` +
                `💗 **${t.comfort}:** \`${comfort}%\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setImage(gifUrl)
            .setFooter({ text: `˚ʚ♡ɞ˚ pat · angela · ${lang.toUpperCase()}` })
            .setTimestamp();
        if (ctx.channel) {
            await ctx.channel.send({ content: `<@${target.id}>`, embeds: [embed] });
            if (ctx.editReply) return ctx.editReply({ content: `✅ **${t.delivered}**` });
        } else {
            return ctx.reply({ embeds: [embed] });
        }
    }
};
