const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const { bot } = require(path.join(process.cwd(), "src/config/settings"));

const warnsPath = path.join(bot.dataDir, "warns.json");

const LOCAL = {
    en: { title: "warn", subject: "Subject", reason: "Reason", status: "Strike Registered", count: "Total Strikes", note: "3 strikes = 24h mute · 5 strikes = 7d mute", notFound: "Target not found.", noReason: "Provide a reason!" },
    tl: { title: "warn", subject: "User", reason: "Dahilan", status: "Strike Naitala", count: "Kabuuang Strikes", note: "3 strikes = 24h mute · 5 strikes = 7d mute", notFound: "Hindi mahanap ang target.", noReason: "Magbigay ng dahilan!" },
    ko: { title: "경고", subject: "유저", reason: "이유", status: "스트라이크 등록됨", count: "총 스트라이크", note: "3 스트라이크 = 24h 뮤트 · 5 스트라이크 = 7d 뮤트", notFound: "대상을 찾을 수 없습니다.", noReason: "이유를 입력해 주세요!" },
    ja: { title: "警告", subject: "ユーザー", reason: "理由", status: "ストライク登録済み", count: "総ストライク", note: "3ストライク = 24h ミュート · 5ストライク = 7d ミュート", notFound: "対象が見つかりません。", noReason: "理由を入力してください！" }
};

function loadWarns() {
    if (!fs.existsSync(warnsPath)) fs.writeFileSync(warnsPath, "{}", "utf8");
    try { return JSON.parse(fs.readFileSync(warnsPath, "utf8") || "{}"); } catch { return {}; }
}

function saveWarns(data) {
    fs.writeFileSync(warnsPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("✦ [Mod] Log a violation against a member")
        .addUserOption(o => o.setName("target").setDescription("Member to warn").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("Violation details").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getMember("target");
        const reason = interaction.options.getString("reason");
        if (!target) return interaction.editReply({ content: `❌ ${t.notFound}` });
        await this.addWarn(interaction, target.user, reason, t, lang);
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.members?.first();
        if (!target) return message.reply(`❌ ${t.notFound}`);
        const reason = args.slice(1).join(" ");
        if (!reason) return message.reply(`❌ ${t.noReason}`);
        await this.addWarn(message, target.user, reason, t, lang);
    },

    async addWarn(ctx, targetUser, reason, t, lang) {
        const guildId = ctx.guildId;
        const db = loadWarns();

        if (!db[guildId]) db[guildId] = {};
        if (!db[guildId][targetUser.id]) db[guildId][targetUser.id] = [];

        const entry = { reason, by: ctx.member?.id || ctx.author?.id || "unknown", at: Date.now() };
        db[guildId][targetUser.id].push(entry);
        saveWarns(db);

        const strikes = db[guildId][targetUser.id].length;
        const bar = "▰".repeat(Math.min(strikes, 10)) + "▱".repeat(Math.max(0, 10 - strikes));

        const embed = new EmbedBuilder()
            .setColor(strikes >= 5 ? "#FF0000" : strikes >= 3 ? "#FF8C00" : "#ffcad4")
            .setAuthor({ name: "angela ♡ | warn", iconURL: ctx.client.user.displayAvatarURL() })
            .setThumbnail(targetUser.displayAvatarURL())
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `⚠️ **${t.subject}:** <@${targetUser.id}>\n` +
                `📋 **${t.reason}:** \`${reason}\`\n` +
                `✦ **Status:** \`${t.status}\`\n` +
                `📊 **${t.count}:** \`${strikes}\` · \`[${bar}]\`\n\n` +
                `> *${t.note}*\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ warn · angela · ${lang.toUpperCase()}` })
            .setTimestamp();

        const channel = ctx.channel;
        await channel.send({ embeds: [embed] });

        // Auto-mute at 3 or 5 strikes
        try {
            const member = await ctx.guild.members.fetch(targetUser.id);
            if (member.moderatable) {
                if (strikes === 3) await member.timeout(86400000, "Auto: 3 strikes");
                if (strikes >= 5) await member.timeout(604800000, "Auto: 5 strikes");
            }
        } catch {}

        if (ctx.editReply) return ctx.editReply({ content: `✅ **Violation logged. Total strikes: ${strikes}**` });
    }
};
