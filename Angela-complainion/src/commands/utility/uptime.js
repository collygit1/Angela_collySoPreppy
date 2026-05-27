const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const os = require('os');
const fs = require('fs');
const path = require('path');

const uptimeDataPath = path.join(process.cwd(), 'src', 'database', 'json', 'uptime.json');

// Using your creepy asset set
const assets = {
    doll: '<:dolls:1470710614182596629>',
    feather: '<:feather:1470710685284700170>',
    scroll: '<:r_scroll:1470710401971781737>',
    ribbon: '<:bow_ribboning:1462028553137815602>'
};

module.exports = {
    name: 'uptime',
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('lets view lec nested system heartbeat.'),

    async execute(interaction) {
        await this.sendUptime(interaction, interaction.user.tag);
    },

    async prefixExecute(message) {
        await this.sendUptime(message, message.author.tag);
    },

    async sendUptime(context, userTag) {
        const client = context.client;

        // 1. 🛡️ DATA LOADING
        let uptimeData = { total_starts: 0, startTime: Date.now() };
        if (fs.existsSync(uptimeDataPath)) {
            try {
                const raw = fs.readFileSync(uptimeDataPath, 'utf8');
                if (raw) uptimeData = JSON.parse(raw);
            } catch (err) { console.error("Read Error:", err); }
        }

        // 2. 🌍 LANGUAGE DETECTION
        let lang = (client.languages?.get?.(context.guildId)) || 'en';
        const translations = {
            en: { title: "SYSTEM UPTIME", heart: "Heartbeat", mem: "Memory", serv: "Sectors", online: "Live Since" },
            tl: { title: "UPTIME NG SYSTEM", heart: "Tibok ng Puso", mem: "Memorya", serv: "Mga Sektor", online: "Online Mula" },
            ko: { title: "시스템 가동 시간", heart: "하트비트", mem: "메모리", serv: "섹터", online: "온라인 시작" },
            ja: { title: "システム稼働時間", heart: "鼓動", mem: "メモリ", serv: "セクター", online: "オンライン開始" }
        };
        const t = translations[lang] || translations['en'];

        // 3. ⏳ CALCULATIONS
        const totalSeconds = process.uptime();
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const uptimeString = `${days}d ${hours}h ${mins}m`;

        const discordTimestamp = Math.floor((uptimeData.startTime) / 1000);
        const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

        // 4. 🎨 NIGHT UI EMBED
        const embed = new EmbedBuilder()
            .setColor('#2B2D31') // Dark Mode UI
            .setAuthor({ 
                name: `angela uptime • ${t.title}`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setTitle(`${assets.doll} HEARTBEAT: **“${uptimeString.toUpperCase()}”**`)
            .setDescription(
                `*“Counting the seconds in the void...”*\n` +
                `♰ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ♰\n` +
                `### ${assets.ribbon} **TELEMETRY DATA**\n` +
                `- **“PROTOCOL STATUS:”** \`STABLE\`\n` +
                `- **“MEMORY LOAD:”** \`${usedRam}MB / ${totalRam}GB\`\n` +
                `- **“TOTAL BOOTS:”** \`${uptimeData.total_starts}\` cycles\n` +
                `- **“CLUSTER ID:”** \`#${client.cluster?.id || 0}\` node\n` +
                `♰ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ♰\n` +
                `> **“LIVE SINCE:”** <t:${discordTimestamp}:R>\n` +
                `> **“ACTIVE SECTORS:”** \`${client.guilds.cache.size}\``
            )
            .addFields(
                { name: `${assets.feather} ${t.heart.toUpperCase()}`, value: `\`${uptimeString}\``, inline: true },
                { name: `${assets.scroll} ${t.mem.toUpperCase()}`, value: `\`${usedRam}MB\``, inline: true },
                { name: `${assets.doll} ${t.serv.toUpperCase()}`, value: `\`${client.guilds.cache.size}\``, inline: true }
            )
            .setImage('https://cdn.discordapp.com/attachments/1455509140326842410/1470706908938895371/IMG_6081.jpeg')
            .setFooter({ 
                text: `• VERSION: D.JS v${version} • OS ENCRYPTION: ACTIVE`, 
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp();

        return context.reply({ embeds: [embed] }).catch(() => {});
    }
};