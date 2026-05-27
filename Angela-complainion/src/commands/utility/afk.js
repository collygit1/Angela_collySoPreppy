const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("node:fs").promises;
const path = require("node:path");
const { bot, colors } = require(path.join(process.cwd(), 'src/config/settings'));

const afkPath = path.join(bot.dataDir, "afk.json");

const translations = {
    en: { afk: "is now AFK", list: "GLOBAL STASIS SCAN", empty: "Every soul is awake." },
    tl: { afk: "ay AFK na", list: "PAGSUSURI NG MGA NATUTULOG", empty: "Gising ang lahat." },
    ko: { afk: "님은 현재 AFK 상태입니다", list: "글로벌 상태 스캔", empty: "모든 영혼이 깨어 있습니다." },
    ja: { afk: "は現在AFKです", list: "グローバルステータススキャン", empty: "全員が起きています。" }
};

module.exports = {
    name: "afk",
    category: "utility",
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Enter the boutique meadow.")
        .addStringOption(o => o.setName("reason").setDescription("Destination reason"))
        .addBooleanOption(o => o.setName("all-server").setDescription("View all active dreamers")),

    async execute(interaction) {
        if (interaction.options.getBoolean("all-server")) return this.handleGlobalList(interaction);
        await this.handleAFK(interaction, interaction.user, interaction.member, interaction.options.getString("reason") || "Away");
    },

    async prefixExecute(message, args) {
        if (["list", "all"].includes(args)) return this.handleGlobalList(message);
        await this.handleAFK(message, message.author, message.member, args.join(" ") || "Away");
    },

    async handleGlobalList(context) {
        const lang = context.client.languages?.get(context.guildId) || 'en';
        const t = translations[lang] || translations.en;
        const entries = Array.from(context.client.afk.entries());

        if (entries.length === 0) return context.reply({ content: `✧ **${t.empty}**`, ephemeral: true });

        const list = entries.slice(0, 10).map(([id, data]) => `• <@${id}>: *${data.reason}* (<t:${Math.floor(data.time / 1000)}:R>)`).join('\n');
        const embed = new EmbedBuilder().setColor(colors.pink).setTitle(t.list).setDescription(list);
        return context.reply({ embeds: [embed] });
    },

    async handleAFK(context, user, member, reason) {
        const lang = context.client.languages?.get(context.guildId) || 'en';
        const t = translations[lang] || translations.en;
        const oldName = member.displayName;

        const afkData = { userId: user.id, reason, time: Date.now(), oldName };
        context.client.afk.set(user.id, afkData);

        // Persistence
        const db = JSON.parse(await fs.readFile(afkPath, "utf8").catch(() => "{}"));
        db[user.id] = afkData;
        await fs.writeFile(afkPath, JSON.stringify(db, null, 2));

        if (member.manageable) await member.setNickname(`[afk] ${oldName}`.slice(0, 32)).catch(() => {});

        return context.reply({ 
            embeds: [new EmbedBuilder().setColor(colors.pink).setDescription(`💤 **${user.username}** ${t.afk}: *${reason}*`)] 
        });
    }
};