const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const path = require("node:path");
const { theme } = require(path.join(process.cwd(), 'src/config/settings'));

/* ================= 🎀 BOUTIQUE EMOJI CORE ================= */
const e = {
    "stars": "<:Starrypinkwizardhat:1498992235184918618>",
    "feather": "<a:Star_:1499359930094977178>",
    "doll": "<:ribbonangela:1405809043057938525>",
    "ribbon": "<a:Pinky_ribbon:1328930688845479940>",
    "flower": "🌸"
};

/* ================= 🌍 TRANSLATIONS ================= */
const translations = {
    en: { scan: "Registry Scan", diag: "Diagnostics", iden: "IDENTITY DATA", tag: "Tag", id: "ID", created: "Created", status: "Status", efficient: "Core running at peak boutique efficiency.", metrics: "Boutique Metrics", uptime: "Uptime", mem: "Memory", sec: "Sectors", restrict: "External system detected. Process scan restricted.", error: "Scan Failed: Synthetic ID not found.", prompt: "Hey! Please select a bot for information." },
    tl: { scan: "Pagsusuri ng Rehistro", diag: "Diagnostics", iden: "DATOS NG PAGKAKAKILANLAN", tag: "Tag", id: "ID", created: "Nilikha", status: "Katayuan", efficient: "Ang core ay tumatakbo sa peak boutique efficiency.", metrics: "Sukatan ng Boutique", uptime: "Uptime", mem: "Memory", sec: "Mga Sektor", restrict: "May nakitang external system. Ang pagsusuri ay limitado.", error: "Bigo ang Scan: Hindi mahanap ang Synthetic ID.", prompt: "Uy! Pumili ka ng bot para sa impormasyon." },
    ko: { scan: "레지스트리 스캔", diag: "진단", iden: "ID 데이터", tag: "태그", id: "ID", created: "생성됨", status: "상태", efficient: "코어가 부티크 효율로 실행 중입니다.", metrics: "부티크 지표", uptime: "가동 시간", mem: "메모리", sec: "섹터", restrict: "외부 시스템이 감지되었습니다. 프로세스 스캔이 제한됩니다.", error: "스캔 실패: 가상 ID를 찾을 수 없습니다.", prompt: "헤이! 정보를 보려면 봇을 선택해 주세요." },
    ja: { scan: "レジストリスキャン", diag: "診断", iden: "身元データ", tag: "タグ", id: "ID", created: "作成日", status: "ステータス", efficient: "コアはブティック効率で動作しています。", metrics: "ブティック指標", uptime: "稼働時間", mem: "メモリ", sec: "セクター", restrict: "外部システムが検出されました。ス캔が制限されています。", error: "ス캔失敗：合成IDが見つかりません。", prompt: "ねえ！情報を得るためにボットを選択してください。" }
};

module.exports = {
    name: 'botinfo',
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('🎀 Scan synthetic entities via Mention or ID')
        .addUserOption(o => o.setName('target').setDescription('Select a bot to scan'))
        .addStringOption(o => o.setName('id').setDescription('Type the Bot ID to scan'))
        .addStringOption(o => o.setName('type').setDescription('Scanning protocol').addChoices(
            { name: 'Registry Info', value: 'info' },
            { name: 'System Process', value: 'process' }
        )),

    async execute(interaction, client) {
        const lang = client.languages?.get(interaction.guildId) || 'en';
        const t = translations[lang] || translations.en;

        const idInput = interaction.options.getString('id');
        let target = interaction.options.getUser('target');
        const type = interaction.options.getString('type') || 'info';

        if (!target && idInput) {
            try {
                target = await client.users.fetch(idInput);
            } catch (err) {
                return interaction.reply({ content: `${e.stars} **${t.error}**`, flags: [MessageFlags.Ephemeral] });
            }
        }

        if (!target) return interaction.reply({ content: `${e.ribbon} **${t.prompt}**`, flags: [MessageFlags.Ephemeral] });
        if (!target.bot) return interaction.reply({ content: `${e.stars} **Access Denied:** Target must be a bot.`, flags: [MessageFlags.Ephemeral] });

        await this.deliverBotScan(interaction, target, type, client, t);
    },

    async prefixExecute(message, args, client) {
        const lang = client.languages?.get(message.guildId) || 'en';
        const t = translations[lang] || translations.en;

        const idFromArgs = args.find(arg => /^\d{17,19}$/.test(arg));
        let target = message.mentions.users.first();
        const type = args.includes('process') ? 'process' : 'info';

        if (!target && idFromArgs) {
            try { target = await client.users.fetch(idFromArgs); } catch (e) { target = null; }
        }

        if (!target) return message.reply(`${e.ribbon} ${t.prompt}`).then(m => setTimeout(() => m.delete(), 5000));
        await this.deliverBotScan(message, target, type, client, t);
    },

    async deliverBotScan(ctx, target, type, client, t) {
        const isAngela = target.id === client.user.id;
        const embed = new EmbedBuilder()
            .setColor(theme?.pink || '#ffcad4')
            .setThumbnail(target.displayAvatarURL({ size: 512 }))
            .setFooter({ text: `ANGELA PROTOCOL: ${type.toUpperCase()} // DESIGNED BY ANGELA` });

        if (type === 'info') {
            embed.setAuthor({ name: `ANGELA OS • ${t.scan}`, iconURL: target.displayAvatarURL() })
                 .setDescription(
                    `### ${e.doll} **${t.iden}**\n` +
                    `${e.feather} **${t.tag}:** \`${target.tag}\`\n` +
                    `${e.feather} **${t.id}:** \`${target.id}\`\n` +
                    `${e.feather} **${t.created}:** <t:${Math.floor(target.createdTimestamp / 1000)}:R>\n` +
                    `🌷 ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ 🌷`
                 );

            if (isAngela) embed.addFields({ name: `${e.ribbon} ${t.status}`, value: `> ${t.efficient}` });
        } else {
            const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const uptime = Math.floor(client.uptime / 1000);
            const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60), s = uptime % 60;

            embed.setAuthor({ name: `ANGELA OS • ${t.diag}`, iconURL: client.user.displayAvatarURL() })
                 .setTitle(`${e.stars} ${t.metrics}`)
                 .setDescription(isAngela ? 
                    `- **${t.uptime}:** \`${h}h ${m}m ${s}s\`\n` +
                    `- **${t.mem}:** \`${memory} MiB\`\n` +
                    `- **${t.sec}:** \`${client.guilds.cache.size}\` servers` : 
                    `> ${e.stars} *${t.restrict}*`);
        }

        return ctx.reply({ embeds: [embed] });
    }
};