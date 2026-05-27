const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const path = require("node:path");
const { fetchGif } = require(path.join(process.cwd(), "src", "utils", "giphy"));

const LOCAL = {
    en: { title: "blush", action: "is blushing", at: "at", temp: "Core Temp", overheat: "OVERHEATING",
        statuses: ["Visual sensors overloaded by cuteness~", "Face temperature rising rapidly!", "Heartbeat.exe has stopped working ♡"] },
    tl: { title: "namumula", action: "ay namumula", at: "kay", temp: "Core Temp", overheat: "NAG-OVERHEAT",
        statuses: ["Visual sensors punung-puno ng kakyutan~", "Bilis ng pag-init ng mukha!", "Tumigil ang Heartbeat.exe ♡"] },
    ko: { title: "얼굴 붉어짐", action: "님이 얼굴을 붉혔어요", at: "에게", temp: "코어 온도", overheat: "과열됨",
        statuses: ["시각 센서가 귀여움으로 마비됐어요~", "얼굴 온도가 급격히 상승 중!", "Heartbeat.exe 작동 중지됨 ♡"] },
    ja: { title: "照れ", action: "が照れています", at: "に対して", temp: "コア温度", overheat: "オーバーヒート",
        statuses: ["視覚センサーが可愛さでオーバーロード~", "顔面温度が急上昇中！", "Heartbeat.exeが停止しました ♡"] }
};

module.exports = {
    name: "blush",
    data: new SlashCommandBuilder()
        .setName("blush")
        .setDescription("✦ Make someone blush!")
        .addUserOption(o => o.setName("user").setDescription("The person making you blush")),
    async execute(interaction) {
        await interaction.deferReply();
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("user");
        await this.deliver(interaction, interaction.user, target, t, lang);
    },
    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first() || null;
        await this.deliver(message, message.author, target, t, lang);
    },
    async deliver(ctx, sender, target, t, lang) {
        const gifUrl = await fetchGif("anime blush");
        const temp = (Math.random() * (41.5 - 37.0) + 37.0).toFixed(1);
        const status = t.statuses[Math.floor(Math.random() * t.statuses.length)];
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: ctx.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `🌺 **${sender.username}** ${t.action}${target ? ` ${t.at} **${target.username}**` : ""}\n\n` +
                `✨ *"${status}"*\n\n` +
                `🌡️ **${t.temp}:** \`${temp}°C\` · 🔥 **Status:** \`[ ${t.overheat} ]\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setImage(gifUrl)
            .setFooter({ text: `˚ʚ♡ɞ˚ blush · angela · ${lang.toUpperCase()}` })
            .setTimestamp();
        if (ctx.editReply) return ctx.editReply({ embeds: [embed] });
        return ctx.reply({ embeds: [embed] });
    }
};
