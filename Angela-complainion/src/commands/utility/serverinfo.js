const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// 🎀 Angela's Visual Assets
const b = {
    starfish: '<:pinkish_starfish:1455901785532268574>',
    cupcake: '<:cupcake:1455889268869435574>',
    cake: '<:cake:1455889214267719721>',
    rolling: '<:rolling:1455889183934513223>',
    icecream: '<:icecream:1455889116070809634>',
    donut: '<:donut:1455889051071811606>',
    moon: '<:moon_atoms:1455934795766038560>',
    atom: '<:atoms_r:1455934918700961833>'
};

// 🏮 THE KORUMA DICTIONARY (Synchronized with OS Protocol)
const local = {
    en: { diag: "SECTOR DIAGNOSTICS", desc: "Sector analysis complete. Data integrity verified.", id: "Sector ID", owner: "Administrator", est: "Established", pop: "Population", units: "Units", bots: "Proxies", boost: "Signal Level", maturity: "Maturity", cycle: "Cycle", days: "Days", reqBy: "Diagnostic requested by:" },
    tl: { diag: "SECTOR DIAGNOSTICS", desc: "Tapos na ang pagsusuri sa sektor. Ligtas ang data.", id: "ID ng Sektor", owner: "Administrator", est: "Itinatag Noong", pop: "Populasyon", units: "Tao", bots: "Proxies", boost: "Signal Level", maturity: "Maturity", cycle: "Siklo", days: "Araw", reqBy: "Hiling ni:" },
    ko: { diag: "섹터 진단", desc: "섹터 분석 완료. 데이터 무결성 확인됨.", id: "섹터 ID", owner: "관리자", est: "설립일", pop: "인구", units: "유닛", bots: "봇 프록시", boost: "신호 레벨", maturity: "성숙도", cycle: "사이클", days: "일", reqBy: "요청자:" },
    ja: { diag: "セクター診断", desc: "セクター分析完了。データの整合性が確認されました。", id: "セクター ID", owner: "管理者", est: "設立日", pop: "人口", units: "ユニット", bots: "ボット", boost: "信号レベル", maturity: "成熟度", cycle: "サイクル", days: "日", reqBy: "リクエスト者:" }
};

module.exports = {
    name: 'server',
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Execute deep sector diagnostics')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction) {
        // Fetch language from client cache (defined in main.js)
        const lang = interaction.client.languages?.get(interaction.guildId) || 'en';
        const t = local[lang] || local.en;

        await interaction.deferReply();

        try {
            const embed = await buildServerEmbed(interaction.guild, interaction.user, t, lang);
            return await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return await interaction.editReply({ content: "❌ `DIAGNOSTIC_FAILURE`: Check system logs." });
        }
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || 'en';
        const t = local[lang] || local.en;

        try {
            const embed = await buildServerEmbed(message.guild, message.author, t, lang);
            return await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return await message.reply("❌ `SYSTEM_ERR`: Diagnostic could not be completed.");
        }
    }
};

async function buildServerEmbed(guild, requester, t, lang) {
    // Ensure all members are cached for accurate population counting
    if (guild.memberCount > guild.members.cache.size) {
        await guild.members.fetch().catch(() => {});
    }

    const owner = await guild.fetchOwner();
    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const humanCount = totalMembers - botCount;

    // 📊 Maturity Logic (ProgressBar)
    const daysOld = Math.floor((Date.now() - guild.createdTimestamp) / (1000 * 60 * 60 * 24));
    const progress = Math.min(Math.floor(daysOld / 30), 10); 
    const progressBar = "▰".repeat(progress) + "▱".repeat(10 - progress);

    const embed = new EmbedBuilder()
        .setColor('#ffcad4')
        .setAuthor({ 
            name: `ANGELA TETRA | ${t.diag}`, 
            iconURL: guild.client.user.displayAvatarURL() 
        })
        .setTitle(`${b.starfish} ${guild.name.toUpperCase()} ${b.starfish}`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
        .setDescription(`> **${t.desc}** ✨`)
        .addFields(
            { name: `${b.cupcake} ${t.id}`, value: `\`${guild.id}\``, inline: true },
            { name: `${b.cake} ${t.owner}`, value: `${owner}`, inline: true },
            { name: `${b.rolling} ${t.est}`, value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            { 
                name: `${b.icecream} ${t.pop}`, 
                value: `\`${humanCount.toLocaleString()}\` ${t.units} • \`${botCount.toLocaleString()}\` ${t.bots}`, 
                inline: false 
            },
            { 
                name: `${b.donut} ${t.boost}`, 
                value: `\`Level ${guild.premiumTier}\` (${guild.premiumSubscriptionCount} Boosts)`, 
                inline: true 
            },
            { 
                name: `${b.starfish} ${t.maturity}`, 
                value: `\`[ ${progressBar} ]\`\n*${t.cycle}: ${daysOld} ${t.days}*`, 
                inline: true 
            }
        )
        .setFooter({ 
            text: `${t.reqBy} ${requester.tag} • Protocol: ${lang.toUpperCase()}`, 
            iconURL: requester.displayAvatarURL({ dynamic: true }) 
        })
        .setTimestamp();

    if (guild.banner) {
        embed.setImage(guild.bannerURL({ size: 1024 }));
    }

    return embed;
}