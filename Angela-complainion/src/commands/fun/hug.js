const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const path = require("node:path");
const { fetchGif } = require(path.join(process.cwd(), "src", "utils", "giphy"));

const LOCAL = {
    en: { title: "hug", header: "Warm Hug Delivered", note: "Note", warmth: "Warmth", defaultNote: "Sending you a warm embrace! 🤗", delivered: "Hug delivered~" },
    tl: { title: "yakap", header: "Mainit na Yakap", note: "Mensahe", warmth: "Init", defaultNote: "Pinapadala kita ng mainit na yakap! 🤗", delivered: "Yakap naipadala~" },
    ko: { title: "포옹", header: "따뜻한 포옹", note: "메모", warmth: "따뜻함", defaultNote: "따뜻한 포옹을 보냅니다! 🤗", delivered: "포옹 전달됨~" },
    ja: { title: "ハグ", header: "温かいハグ", note: "メモ", warmth: "温かさ", defaultNote: "温かい抱擁を送ります！ 🤗", delivered: "ハグが届きました~" }
};

module.exports = {
    name: "hug",
    data: new SlashCommandBuilder()
        .setName("hug")
        .setDescription("✦ Give someone a warm hug~")
        .addUserOption(o => o.setName("user").setDescription("Who to hug").setRequired(true))
        .addStringOption(o => o.setName("message").setDescription("Add a sweet note"))
        .addBooleanOption(o => o.setName("mention").setDescription("Ping the user?")),
    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("user");
        const note = interaction.options.getString("message");
        const mention = interaction.options.getBoolean("mention") ?? false;
        await this.deliver(interaction, interaction.user, target, note, mention, t, lang);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first();
        if (!target) return message.reply("🎀 Mention someone to hug!");
        const note = args.slice(1).join(" ") || null;
        await this.deliver(message, message.author, target, note, false, t, lang);
    },
    async deliver(ctx, sender, target, note, mention, t, lang) {
        const gifUrl = await fetchGif("anime hug");
        const warmth = Math.floor(Math.random() * 5) + 6;
        const bar = "▰".repeat(warmth) + "▱".repeat(10 - warmth);
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `🤗 **${t.header}**\n> **From:** ${sender} 🎀 **To:** ${mention ? `<@${target.id}>` : `**${target.username}**`}\n\n` +
                `💌 **${t.note}:** ·˚ " *${note || t.defaultNote}* "\n\n` +
                `💗 **${t.warmth}:** \`${warmth * 10}%\` · \`[${bar}]\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setImage(gifUrl)
            .setFooter({ text: `˚ʚ♡ɞ˚ hug · angela · ${lang.toUpperCase()}` })
            .setTimestamp();
        if (ctx.channel) {
            await ctx.channel.send({ content: mention ? `${target}` : null, embeds: [embed] });
            if (ctx.editReply) await ctx.editReply({ content: `✅ **${t.delivered}**` });
        } else {
            return ctx.reply({ embeds: [embed] });
        }
    }
};
