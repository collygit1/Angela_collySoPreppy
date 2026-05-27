const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const { bot } = require(path.join(process.cwd(), "src/config/settings"));

const warnsPath = path.join(bot.dataDir, "warns.json");

const LOCAL = {
    en: { title: "warn list", subject: "Subject", history: "Violation History", strikes: "Total Strikes", risk: "Risk Level", clean: "No violations on record ✦", risks: ["🟢 Clean", "🟡 Caution", "🟠 High Risk", "🔴 Danger"] },
    tl: { title: "listahan ng warn", subject: "User", history: "Kasaysayan ng Paglabag", strikes: "Kabuuang Strikes", risk: "Antas ng Panganib", clean: "Walang rekord ng paglabag ✦", risks: ["🟢 Malinis", "🟡 Mag-ingat", "🟠 Mataas na Panganib", "🔴 Mapanganib"] },
    ko: { title: "경고 목록", subject: "유저", history: "위반 기록", strikes: "총 스트라이크", risk: "위험 수준", clean: "위반 기록 없음 ✦", risks: ["🟢 클린", "🟡 주의", "🟠 고위험", "🔴 위험"] },
    ja: { title: "警告リスト", subject: "ユーザー", history: "違反履歴", strikes: "総ストライク", risk: "リスクレベル", clean: "違反記録なし ✦", risks: ["🟢 クリーン", "🟡 注意", "🟠 高リスク", "🔴 危険"] }
};

function loadWarns() {
    if (!fs.existsSync(warnsPath)) return {};
    try { return JSON.parse(fs.readFileSync(warnsPath, "utf8") || "{}"); } catch { return {}; }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warnlist")
        .setDescription("✦ [Mod] View a member's violation history")
        .addUserOption(o => o.setName("target").setDescription("Member to check").setRequired(true))
        .addBooleanOption(o => o.setName("clear").setDescription("Clear all warns for this user? (Admin only)"))
        .setDefaultMemberPermissions(8n),

    async execute(interaction) {
        const lang = interaction.client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = interaction.options.getUser("target");
        const clear = interaction.options.getBoolean("clear") || false;
        await this.show(interaction, target, t, lang, clear);
    },

    async prefixExecute(message, args) {
        const lang = message.client.languages?.get(message.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const target = message.mentions.users.first();
        if (!target) return message.reply("❌ Mention a user to check their warn history.");
        const clear = args.includes("clear");
        await this.show(message, target, t, lang, clear);
    },

    async show(ctx, target, t, lang, clear) {
        const db = loadWarns();
        const guildWarns = db[ctx.guildId] || {};

        if (clear) {
            if (!ctx.member?.permissions?.has(8n) && !ctx.member?.permissions?.has("Administrator")) {
                const deny = ctx.reply ? ctx.reply({ content: "❌ Administrator only.", ephemeral: true }) : ctx.reply("❌ Administrator only.");
                return deny;
            }
            if (db[ctx.guildId]) delete db[ctx.guildId][target.id];
            const { writeFileSync } = require("node:fs");
            writeFileSync(warnsPath, JSON.stringify(db, null, 2));
            return (ctx.reply || ctx.channel.send.bind(ctx.channel))({ content: `✅ Cleared all warns for **${target.username}**.` });
        }

        const userWarns = guildWarns[target.id] || [];
        const strikes = userWarns.length;

        if (strikes === 0) {
            const embed = new EmbedBuilder()
                .setColor("#ffcad4")
                .setAuthor({ name: "angela ♡ | warn list", iconURL: ctx.client.user.displayAvatarURL() })
                .setThumbnail(target.displayAvatarURL())
                .setDescription(`⊹ ─────────────────── ⊹\n⚠️ **${t.subject}:** **${target.username}**\n\n✨ ${t.clean}\n⊹ ─────────────────── ⊹`)
                .setFooter({ text: `˚ʚ♡ɞ˚ warnlist · angela · ${lang.toUpperCase()}` });
            return ctx.reply({ embeds: [embed] });
        }

        const riskIdx = strikes >= 5 ? 3 : strikes >= 3 ? 2 : strikes >= 1 ? 1 : 0;
        const riskLabel = t.risks[riskIdx];
        const history = userWarns.slice(-5).map((w, i) =>
            `꒰ **#${i + 1}** ꒱ \`${w.reason}\` · <t:${Math.floor(w.at / 1000)}:R>`
        ).join("\n");
        const bar = "▰".repeat(Math.min(strikes, 10)) + "▱".repeat(Math.max(0, 10 - strikes));

        const embed = new EmbedBuilder()
            .setColor(strikes >= 5 ? "#FF0000" : strikes >= 3 ? "#FF8C00" : "#ffcad4")
            .setAuthor({ name: "angela ♡ | warn list", iconURL: ctx.client.user.displayAvatarURL() })
            .setThumbnail(target.displayAvatarURL())
            .setDescription(
                `⊹ ─────────────────── ⊹\n` +
                `⚠️ **${t.subject}:** **${target.username}**\n` +
                `📊 **${t.strikes}:** \`${strikes}\` · \`[${bar}]\`\n` +
                `🔰 **${t.risk}:** \`${riskLabel}\`\n\n` +
                `📋 **${t.history}** *(last 5)*\n${history}\n` +
                `⊹ ─────────────────── ⊹`
            )
            .setFooter({ text: `˚ʚ♡ɞ˚ warnlist · angela · ${lang.toUpperCase()}` })
            .setTimestamp();

        return ctx.reply({ embeds: [embed] });
    }
};
