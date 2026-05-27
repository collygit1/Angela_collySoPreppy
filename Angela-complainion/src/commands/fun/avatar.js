const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const LOCAL = {
    en: { title: "avatar", user: "User", global: "Global Avatar", server: "Server Avatar", download: "Download" },
    tl: { title: "avatar", user: "Gumagamit", global: "Global Avatar", server: "Server Avatar", download: "I-download" },
    ko: { title: "아바타", user: "사용자", global: "글로벌 아바타", server: "서버 아바타", download: "다운로드" },
    ja: { title: "アバター", user: "ユーザー", global: "グローバルアバター", server: "サーバーアバター", download: "ダウンロード" },
};

module.exports = {
    name: "avatar",
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("✦ View someone's avatar")
        .addUserOption(o => o.setName("user").setDescription("User to view (defaults to you)")),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("user") || interaction.user;
        const member = interaction.guild?.members.cache.get(target.id);
        await this.deliver(interaction, target, member, t);
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first() || message.author;
        const member = message.guild?.members.cache.get(target.id);
        await this.deliver(message, target, member, t);
    },

    async deliver(ctx, target, member, t) {
        const globalUrl = target.displayAvatarURL({ size: 1024, extension: "png" });
        const serverUrl = member?.avatar
            ? member.displayAvatarURL({ size: 1024, extension: "png" })
            : null;

        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setTitle(`🖼️ ${target.username}`)
            .setImage(serverUrl || globalUrl)
            .setTimestamp();

        const fields = [{ name: `🌐 ${t.global}`, value: `[${t.download}](${globalUrl})`, inline: true }];
        if (serverUrl) fields.push({ name: `🏠 ${t.server}`, value: `[${t.download}](${serverUrl})`, inline: true });
        embed.addFields(fields);

        const isSlash = !!ctx.deferReply;
        if (isSlash) await ctx.reply({ embeds: [embed] });
        else await ctx.reply({ embeds: [embed] });
    },
};
