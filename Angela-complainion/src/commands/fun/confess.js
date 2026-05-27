const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const path = require("node:path");
const { fetchGif } = require(path.join(process.cwd(), "src", "utils", "giphy"));

const LOCAL = {
    en: { title: "confession", auth: "SECRET SERVICE", link: "Connection Link", packet: "Data Packet", content: "Transmission", sync: "Sync Protocol", defaultMsg: "The stars have linked you~", delivered: "Confession delivered secretly ♡" },
    tl: { title: "kumpisal", auth: "SECRET SERVICE", link: "Koneksyon Link", packet: "Data Packet", content: "Transmisyon", sync: "Sync Protocol", defaultMsg: "Pinagtagpo kayo ng mga bituin~", delivered: "Naipadala na nang palihim ♡" },
    ko: { title: "고백", auth: "시크릿 서비스", link: "연결 링크", packet: "데이터 패킷", content: "전송 내용", sync: "동기화 프로토콜", defaultMsg: "별들이 당신을 연결했어요~", delivered: "몰래 전송 완료 ♡" },
    ja: { title: "告白", auth: "シークレットサービス", link: "接続リンク", packet: "データパケット", content: "送信内容", sync: "同期プロトコル", defaultMsg: "星があなたを繋ぎました～", delivered: "こっそり配信されました ♡" }
};

module.exports = {
    name: "confess",
    data: new SlashCommandBuilder()
        .setName("confess")
        .setDescription("✦ Send a secret confession")
        .addUserOption(o => o.setName("user").setDescription("The recipient").setRequired(true))
        .addStringOption(o => o.setName("message").setDescription("Your secret message"))
        .addUserOption(o => o.setName("member").setDescription("Second person to link"))
        .addBooleanOption(o => o.setName("mention").setDescription("Ping the users?"))
        .addAttachmentOption(o => o.setName("attachment").setDescription("Custom card image")),
    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("user");
        const member = interaction.options.getUser("member");
        const message = interaction.options.getString("message");
        const mention = interaction.options.getBoolean("mention") ?? false;
        const attachment = interaction.options.getAttachment("attachment");
        const gifUrl = attachment ? attachment.url : await fetchGif("anime love confession");
        const score = Math.floor(Math.random() * 8) + 3;
        const bar = "▰".repeat(score) + "▱".repeat(10 - score);
        const user1 = mention ? `<@${target.id}>` : `**${target.username}**`;
        const user2 = member ? (mention ? `<@${member.id}>` : `**${member.username}**`) : null;
        const pairingLine = member ? `${user1} 🎀 ${user2}` : `**To:** ${user1}`;
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `💌 **${member ? t.link : t.packet}**\n> ${pairingLine}\n\n` +
                `✨ **${t.content}**\n·˚ " *${message || t.defaultMsg}* "\n\n` +
                `💗 **${t.sync}:** \`${score * 10}%\` · \`[${bar}]\`\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setImage(gifUrl)
            .setFooter({ text: `˚ʚ♡ɞ˚ confess · angela · ${lang.toUpperCase()}` })
            .setTimestamp();
        await interaction.channel.send({ content: mention ? `${target} ${member ?? ""}` : null, embeds: [embed] });
        await interaction.editReply({ content: `✅ **${t.delivered}**` });
    }
};
