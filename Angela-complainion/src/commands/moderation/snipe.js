const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

/* ================= 🎀 LACRIMOSA VOID ASSETS ================= */
const e = {
    "bow": "<:bow_ribboning:1462028553137815602>",
    "stars": "<:stars_bluesly:1470722789441933355>",
    "doll": "<:dolls:1470710614182596629>",
    "ribbon": "<:cute_ribbons:1471689825970164016>",
    "stitch": "🧵",
    "needle": "🪡",
    "void": "♰"
};

const lang = {
    en: { noSig: "NURSERY_EMPTY", title: "DOLLHOUSE RECOVERY", source: "LOST_SOUL", status: "STITCH_INTEGRITY", time: "DECAY_START", sector: "PLAYROOM", empty: "CRADLE_VACANT" },
    ko: { noSig: "보육원_비어있음", title: "인형의 집 복구", source: "잃어버린 영혼", status: "스티치 무결성", time: "부패 시작", sector: "놀이방", empty: "요람이 비어 있음" },
    ja: { noSig: "苗床は空です", title: "ドールハウスの復元", source: "迷える魂", status: "ステッチの整合性", time: "崩壊開始", sector: "プレイルーム", empty: "ゆりかごは空です" },
    tl: { noSig: "WALANG_BATA", title: "PAGBAWI NG MANIKA", source: "Nawawalang_Kaluluwa", status: "STITCH_INTEGRIDAD", time: "SIMULA_NG_PAGBULOK", sector: "SILID_LARUAN", empty: "WALANG_LAMAN" }
};

module.exports = {
    name: 'snipe',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("snipe")
        .setDescription("Stitch together fragments of a lost memory")
        .addIntegerOption(o => o.setName('index').setDescription('Doll Depth (1-5)').setMinValue(1).setMaxValue(5))
        .addChannelOption(o => o.setName('channel').setDescription('Sector to exhume'))
        .addBooleanOption(o => o.setName('list').setDescription('Show all rotting fragments')),

    async execute(interaction, client) {
        const locale = client.languages?.get(interaction.guildId) || 'en';
        const isList = interaction.options.getBoolean('list');

        await interaction.deferReply({ flags: isList ? [MessageFlags.Ephemeral] : [] });

        const index = interaction.options.getInteger('index') || 1;
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

        await deliverDollSnipe(interaction, client, index, targetChannel, isList, locale);
    },

    async prefixExecute(message, args, client) {
        const locale = client.languages?.get(message.guildId) || 'en';
        const isList = args.includes('list');
        const index = parseInt(args.find(arg => !isNaN(arg) && !arg.includes('<#'))) || 1;
        const channelMention = args.find(arg => arg.startsWith('<#'));
        const channelId = channelMention ? channelMention.replace(/[<#>]/g, '') : null;
        const targetChannel = message.guild.channels.cache.get(channelId) || message.channel;

        await deliverDollSnipe(message, client, index, targetChannel, isList, locale);
    }
};

async function deliverDollSnipe(ctx, client, inputIndex, channel, showList, locale) {
    const t = lang[locale] || lang.en;
    const snipeData = client.snipes.get(channel.id);

    if (!snipeData || (Array.isArray(snipeData) && snipeData.length === 0)) {
        return smartReply(ctx, `\`[VOID]\` ${e.doll} **${t.noSig}**`, true);
    }

    const snipes = Array.isArray(snipeData) ? snipeData : [snipeData];

    if (showList) {
        const listDesc = snipes.map((s, i) => `\`[${i + 1}]\` ${e.bow} **${s.author.username}** ⮞ \`SIGNAL: ${s.content?.slice(0, 15) || "PURGED"}...\``).join('\n');
        const listEmbed = new EmbedBuilder()
            .setColor("#0a0a0a")
            .setAuthor({ name: `angela ♡ | snipe log`, iconURL: client.user.displayAvatarURL() })
            .setDescription(`**SECTOR:** <#${channel.id}>\n\n${listDesc}`)
            .setFooter({ text: `˚ʚ♡ɞ˚ snipe · angela · ${locale.toUpperCase()}` });
        return smartReply(ctx, { embeds: [listEmbed] });
    }

    const target = snipes[inputIndex - 1];
    if (!target) return smartReply(ctx, `${e.needle} **${t.empty}**`, true);

    const embed = new EmbedBuilder()
        .setColor("#1c0000")
        .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: client.user.displayAvatarURL() })
        .setThumbnail(target.author.avatar || null)
        .setDescription(
            `⊹ ─────────────────── ⊹\n` +
            `${e.doll} **${t.source}:** <@${target.author.id}>\n` +
            `${e.bow} **${t.sector}:** <#${channel.id}>\n` +
            `${e.stars} **${t.time}:** <t:${Math.floor(target.timestamp / 1000)}:R>\n\n` +
            `**DECRYPTED WHISPER:**\n` +
            `> ${target.content || `*${e.stitch} [Muffled Silence]*`}\n` +
            `⊹ ─────────────────── ⊹`
        )
        .setImage(target.image || null)
        .setFooter({ text: `˚ʚ♡ɞ˚ snipe ${inputIndex}/${snipes.length} · angela · ${locale.toUpperCase()}` });

    const sentMsg = await smartReply(ctx, { embeds: [embed] });

    // Decay timer
    setTimeout(async () => {
        try {
            if (ctx.deleteReply) await ctx.deleteReply();
            else if (sentMsg?.delete) await sentMsg.delete();
        } catch (err) { }
    }, 25000);
}

async function smartReply(ctx, payload, ephemeral = false) {
    const options = typeof payload === 'string' ? { content: payload } : payload;
    if (ctx.deferred || ctx.replied) return await ctx.editReply(options);
    const m = await ctx.reply(options);
    if (ephemeral && !ctx.commandName) setTimeout(() => m.delete().catch(() => {}), 5000);
    return m;
}