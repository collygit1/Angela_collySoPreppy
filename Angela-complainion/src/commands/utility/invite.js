const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const prefixFilePath = path.join(process.cwd(), "src", "database", "json", "prefixes.json");
const defaultPrefix = "Angela^"; // Updated to your new prefix

// --- 🎨 NEW EMOJI ASSETS ---
const e = {
    stars: '<:stars_bluesly:1470722789441933355>',
    feather: '<:wr_feathes:1470722817778647111>',
    doll: '<:dolls:1470710614182596629>',
    ribbon: '<:bow_ribboning:1462028553137815602>',
    rules: '<:book_rules:1470711929482903552>'
};

module.exports = {
    name: 'invite',
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('🎀 Get the bot invite link and current protocol prefix'),

    async execute(interaction) {
        await this.handleInvite(interaction, interaction.user);
    },

    async prefixExecute(message) {
        await this.handleInvite(message, message.author);
    },

    async handleInvite(context, user) {
        const client = context.client;
        const guildId = context.guildId;
        const currentPrefix = getPrefix(guildId);
        const lang = client.languages?.get(guildId) || 'en';

        const translations = {
            en: { title: "ACCESS PORTAL", deploy: "Deployment Ready", desc: "Integrate **Angela** into your sector to begin neural synchronization.", detail: "PROTOCOL DETAILS", pre: "Current Prefix", acc: "Manual Access", btn: "Synchronize Angela" },
            tl: { title: "PORTAL NG ACCESS", deploy: "Handa na para sa Deployment", desc: "I-integrate si **Angela** sa iyong sektor para simulan ang neural synchronization.", detail: "DETALYE NG PROTOCOL", pre: "Prefix Ngayon", acc: "Manual na Access", btn: "I-sync si Angela" },
            ko: { title: "액세스 포털", deploy: "배포 준비 완료", desc: "신경 동기화를 시작하려면 **Angela**를 섹터에 통합하십시오.", detail: "프로토콜 세부 정보", pre: "현재 접두사", acc: "수동 액세스", btn: "라크리모사 동기화" },
            ja: { title: "アクセス・ポータル", deploy: "デプロイ準備完了", desc: "神経同期を開始するには、**Angela**をセクターに統合してください。", detail: "プロトコルの詳細", pre: "現在のプレフィックス", acc: "手動アクセス", btn: "Angelaを同期する" }
        };

        const t = translations[lang] || translations.en;

        const embed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setAuthor({ 
                name: `ANGELA OS • ${t.title}`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setDescription(
                `────୨ৎ─── ────୨ৎ─── ────୨ৎ───\n` +
                `### Hello, I’m Angela (beta)\n\n` +
                `> ${e.doll} **“${t.deploy.toUpperCase()}”**\n\n` +
                `────୨ৎ── ────୨ৎ─── ────୨ৎ───\n` +
                `${e.feather} ${t.desc}\n\n` +
                `**“${t.detail}”**\n` +
                `- **${e.stars} ${t.pre}:** \`${currentPrefix}\`\n` +
                `- **${e.rules} ${t.acc}:** \`${currentPrefix}help\`\n` +
                `♰ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ♰`
            )
            .setFooter({ 
                text: `REQUESTED BY ${user.tag.toUpperCase()} • v1.0.2`, 
                iconURL: user.displayAvatarURL() 
            })
            .setTimestamp();

        const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel(t.btn)
                .setEmoji(e.ribbon)
                .setStyle(ButtonStyle.Link)
                .setURL(inviteURL)
        );

        if (context.isChatInputCommand?.()) {
            await context.reply({ embeds: [embed], components: [row] });
        } else {
            await context.reply({ content: `︰ ${e.stars} ﹕**${t.title}**`, embeds: [embed], components: [row] });
        }
    }
};

function getPrefix(guildId) {
    if (fs.existsSync(prefixFilePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(prefixFilePath, 'utf8'));
            return data[guildId] || defaultPrefix;
        } catch { return defaultPrefix; }
    }
    return defaultPrefix;
}