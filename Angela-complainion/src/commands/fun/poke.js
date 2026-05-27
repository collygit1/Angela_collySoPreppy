const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const path = require("node:path");
const { fetchGif } = require(path.join(process.cwd(), "src", "utils", "giphy"));

const LOCAL = {
    en: { title: "poke", header: "Poke Detected!", attention: "Attention Level", delivered: "Poke delivered~",
        statuses: ["Attention required! Poking target repeatedly.", "Tactile sensor engaged. Boop ♡", "Target notification sent via poke~"] },
    tl: { title: "sundot", header: "Sundot na-detect!", attention: "Antas ng Atensiyon", delivered: "Sundot naipadala~",
        statuses: ["Kailangan ng atensiyon! Sinusundot ang target.", "Tactile sensor engaged. Boop ♡", "Notipikasyon naipadala sa pamamagitan ng sundot~"] },
    ko: { title: "찌르기", header: "찌르기 감지!", attention: "주의 수준", delivered: "찌르기 전달됨~",
        statuses: ["주의가 필요해요! 타겟을 반복해서 찌르는 중.", "촉각 센서 가동. 붑 ♡", "찌르기를 통해 타겟에게 알림~"] },
    ja: { title: "つつき", header: "つつき検知！", attention: "注意レベル", delivered: "つつき届きました~",
        statuses: ["注意が必要です！ターゲットを繰り返しついています。", "触覚センサー有効。ブッブー ♡", "つつきによるターゲット通知~"] }
};

module.exports = {
    name: "poke",
    data: new SlashCommandBuilder()
        .setName("poke")
        .setDescription("✦ Poke someone!")
        .addUserOption(o => o.setName("user").setDescription("Who to poke").setRequired(true)),
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
        if (!target) return message.reply("🎀 Mention someone to poke!");
        await this.deliver(message, message.author, target, t, lang);
    },
    async deliver(ctx, sender, target, t, lang) {
        const gifUrl = await fetchGif("anime poke");
        const attention = Math.floor(Math.random() * 50) + 10;
        const status = t.statuses[Math.floor(Math.random() * t.statuses.length)];
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `👉 **${t.header}**\n> ${sender} 🎀 **${target.username}**\n\n` +
                `✨ *"${status}"*\n\n` +
                `📡 **${t.attention}:** \`${attention}%\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setImage(gifUrl)
            .setFooter({ text: `˚ʚ♡ɞ˚ poke · angela · ${lang.toUpperCase()}` })
            .setTimestamp();
        if (ctx.channel) {
            await ctx.channel.send({ content: `<@${target.id}>`, embeds: [embed] });
            if (ctx.editReply) return ctx.editReply({ content: `✅ **${t.delivered}**` });
        } else {
            return ctx.reply({ embeds: [embed] });
        }
    }
};
