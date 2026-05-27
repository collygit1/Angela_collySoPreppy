const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const path = require("node:path");
const { fetchGif } = require(path.join(process.cwd(), "src", "utils", "giphy"));

const LOCAL = {
    en: { title: "kiss", header: "Sweet Kiss~", affection: "Affection Level", delivered: "Kiss delivered~ ♡",
        statuses: ["A sweet kiss sent with love ♡", "Heart rate spiking... kiss confirmed~", "Romantic transmission complete ♡"] },
    tl: { title: "halik", header: "Matamis na Halik~", affection: "Antas ng Pagmamahal", delivered: "Halik naipadala~ ♡",
        statuses: ["Isang matamis na halik na may pagmamahal ♡", "Tibok ng puso ay tumataas... halik na-confirm~", "Romantikong transmisyon tapos na ♡"] },
    ko: { title: "키스", header: "달콤한 키스~", affection: "애정 수준", delivered: "키스 전달됨~ ♡",
        statuses: ["사랑을 담은 달콤한 키스 ♡", "심박수 급상승... 키스 확인됨~", "로맨틱 전송 완료 ♡"] },
    ja: { title: "キス", header: "甘いキス~", affection: "愛情度", delivered: "キス届きました~ ♡",
        statuses: ["愛を込めた甘いキス ♡", "心拍数急上昇... キス確認されました~", "ロマンチック伝送完了 ♡"] },
};

module.exports = {
    name: "kiss",
    data: new SlashCommandBuilder()
        .setName("kiss")
        .setDescription("✦ Send a sweet kiss~")
        .addUserOption(o => o.setName("user").setDescription("Who to kiss").setRequired(true))
        .addBooleanOption(o => o.setName("mention").setDescription("Ping the user?")),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("user");
        const mention = interaction.options.getBoolean("mention") ?? false;
        await this.deliver(interaction, interaction.user, target, mention, t, lang);
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first();
        if (!target) return message.reply(`💋 ${lang === "tl" ? "Mag-mention ng isang tao!" : lang === "ko" ? "누군가를 멘션해 주세요!" : lang === "ja" ? "誰かをメンションしてください！" : "Mention someone to kiss!"}`);
        await this.deliver(message, message.author, target, false, t, lang);
    },

    async deliver(ctx, sender, target, mention, t, lang) {
        const gif = await fetchGif("anime kiss");
        const affection = Math.floor(Math.random() * 41) + 60;
        const status = t.statuses[Math.floor(Math.random() * t.statuses.length)];
        const bar = "💗".repeat(Math.floor(affection / 10)) + "🤍".repeat(10 - Math.floor(affection / 10));

        const embed = new EmbedBuilder()
            .setColor("#ffb6c1")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client?.user.displayAvatarURL() ?? ctx.client.user.displayAvatarURL() })
            .setTitle(`💋 ${t.header}`)
            .setDescription(`**${sender.username}** 💋 **${target.username}**\n\n> ${status}`)
            .addFields({ name: t.affection, value: `${bar} **${affection}%**`, inline: false })
            .setFooter({ text: t.delivered })
            .setTimestamp();

        if (gif) embed.setImage(gif);

        const content = mention ? `${target}` : undefined;
        const isSlash = !!ctx.deferReply;
        if (isSlash) {
            await ctx.channel.send({ content, embeds: [embed] });
            await ctx.editReply({ content: `💋 ${t.delivered}` });
        } else {
            await ctx.reply({ content, embeds: [embed] });
        }
    },
};
