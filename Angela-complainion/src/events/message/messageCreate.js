const { Events, EmbedBuilder } = require("discord.js");
const fs   = require("node:fs");
const path = require("node:path");
const { bot, colors } = require("../../config/settings");
const { checkSpam }            = require("../../addons/automod/antiSpam");
const { checkSwear, checkImage } = require("../../addons/automod/automod");

const afkPath = path.join(__dirname, "../database/json/afk.json");

const AFK_LANG = {
    en: { back: "Welcome back",          gone: "You were gone for", afk: "is AFK",           dream: "Dreaming since"     },
    tl: { back: "Maligayang pagbabalik", gone: "Wala ka nang",      afk: "ay AFK",            dream: "Nananaginip simula" },
    ko: { back: "환영합니다",              gone: "자리를 비운 시간:",  afk: "님은 AFK 상태입니다", dream: "꿈을 꾸는 중:"       },
    ja: { back: "おかえりなさい",          gone: "不在時間：",         afk: "はAFKです",           dream: "夢の中："            },
};

module.exports = {
    name: Events.MessageCreate,

    async execute(message, client) {
        if (!message.guild || message.author.bot) return;

        const { guild, author, member } = message;
        const lang   = client.languages?.get(guild.id) || "en";
        const t      = AFK_LANG[lang] || AFK_LANG.en;
        const prefix = client.prefixes?.get(guild.id) || bot.prefix;

        /* ── AFK: Wake up the user if they send a message ── */
        if (client.afk?.has(author.id) && !message.content.startsWith(`${prefix}afk`)) {
            const data = client.afk.get(author.id);
            client.afk.delete(author.id);

            try {
                if (fs.existsSync(afkPath)) {
                    const db = JSON.parse(fs.readFileSync(afkPath, "utf8") || "{}");
                    delete db[author.id];
                    fs.writeFileSync(afkPath, JSON.stringify(db, null, 2));
                }
            } catch {}

            if (member?.manageable) await member.setNickname(data.oldName || null).catch(() => {});

            const wakeEmbed = new EmbedBuilder()
                .setColor("#b6ffb6")
                .setDescription(`🌸 **${t.back}, ${author.username}!** ${t.gone} <t:${Math.floor(data.time / 1000)}:R>.`);

            message.reply({ embeds: [wakeEmbed] })
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 6000))
                .catch(() => {});
        }

        /* ── AFK: Notify sender when they mention an AFK user ── */
        if (message.mentions.users.size > 0) {
            for (const [, user] of message.mentions.users) {
                const afkData = client.afk?.get(user.id);
                if (!afkData) continue;

                const mentionEmbed = new EmbedBuilder()
                    .setColor(colors.pink)
                    .setDescription(
                        `💤 **${user.username}** ${t.afk}: *${afkData.reason}*\n` +
                        `> ${t.dream} <t:${Math.floor(afkData.time / 1000)}:R>`
                    );

                message.reply({ embeds: [mentionEmbed] }).catch(() => {});
            }
        }

        /* ── Security systems ── */
        await checkSpam(message, client);
        await checkSwear(message, client);
        await checkImage(message, client);

        /* ── Prefix command router ── */
        if (!message.content.startsWith(prefix)) return;

        const args    = message.content.slice(prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        const cmd     = client.commands.get(cmdName)
                     || client.commands.find(c => c.aliases?.includes(cmdName));

        if (cmd?.prefixExecute) {
            try {
                await cmd.prefixExecute(message, args, client);
            } catch (err) {
                console.error(`Prefix Command Error [${cmdName}]:`, err);
            }
        }
    },
};
