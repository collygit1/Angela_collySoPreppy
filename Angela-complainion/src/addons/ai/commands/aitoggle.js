const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs   = require("fs");
const path = require("path");

const TOGGLE_PATH = path.join(process.cwd(), "src", "database", "json", "ai_toggle.json");

function loadToggle() {
    try {
        return JSON.parse(fs.readFileSync(TOGGLE_PATH, "utf8") || "{}");
    } catch { return {}; }
}

function saveToggle(data) {
    try { fs.writeFileSync(TOGGLE_PATH, JSON.stringify(data, null, 2)); } catch {}
}

function isDisabled(guildId) {
    return loadToggle()[guildId] === false;
}

const LOCAL = {
    en: { title: "AI Toggle", on: "Angela AI is now **ON** for this server~", off: "Angela AI has been turned **OFF** for this server.", status: "Current Status", enabled: "✅ Online", disabled: "❌ Offline", noPerms: "You need **Manage Server** permission to do this." },
    tl: { title: "AI Toggle", on: "Naka-ON na si Angela AI sa server na ito~", off: "Naka-OFF na ang Angela AI sa server na ito.", status: "Kasalukuyang Status", enabled: "✅ Online", disabled: "❌ Offline", noPerms: "Kailangan mo ng permisong **Manage Server** para dito." },
    ko: { title: "AI 토글", on: "이 서버에서 Angela AI가 **켜졌습니다**~", off: "이 서버에서 Angela AI가 **꺼졌습니다**.", status: "현재 상태", enabled: "✅ 온라인", disabled: "❌ 오프라인", noPerms: "**서버 관리** 권한이 필요합니다." },
    ja: { title: "AI トグル", on: "このサーバーでAngela AIが**オン**になりました~", off: "このサーバーでAngela AIが**オフ**になりました。", status: "現在の状態", enabled: "✅ オンライン", disabled: "❌ オフライン", noPerms: "**サーバー管理**権限が必要です。" },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("aitoggle")
        .setDescription("✦ Enable or disable Angela's AI chat for this server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o
            .setName("action")
            .setDescription("Turn AI on or off (leave blank to check status)")
            .addChoices(
                { name: "on  — enable AI chat", value: "on"  },
                { name: "off — disable AI chat", value: "off" },
            )),

    async execute(interaction) {
        const lang   = interaction.client.languages?.get(interaction.guildId) || "en";
        const t      = LOCAL[lang] || LOCAL.en;
        const action = interaction.options.getString("action");
        const data   = loadToggle();
        const guildId = interaction.guildId;

        if (!action) {
            const currently = isDisabled(guildId) ? t.disabled : t.enabled;
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#ffcad4")
                    .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("🤖 AI Status")
                    .addFields({ name: t.status, value: currently })
                    .setFooter({ text: "Use /aitoggle on | off to change · ˚ʚ♡ɞ˚ angela" })
            ], ephemeral: true });
        }

        const turningOn = action === "on";

        if (turningOn) {
            delete data[guildId];
            interaction.client.aiDisabled?.delete(guildId);
        } else {
            data[guildId] = false;
            interaction.client.aiDisabled?.add(guildId);
        }

        saveToggle(data);

        const embed = new EmbedBuilder()
            .setColor(turningOn ? "#4CAF50" : "#FF6B6B")
            .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(turningOn ? "✅ AI Enabled" : "❌ AI Disabled")
            .setDescription(turningOn ? t.on : t.off)
            .addFields({ name: t.status, value: turningOn ? t.enabled : t.disabled })
            .setFooter({ text: `Changed by ${interaction.user.tag} · ˚ʚ♡ɞ˚ angela` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async prefixExecute(message, args) {
        const lang  = message.client.languages?.get(message.guildId) || "en";
        const t     = LOCAL[lang] || LOCAL.en;

        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild) &&
            message.author.id !== message.guild?.ownerId) {
            return message.reply(`❌ ${t.noPerms}`);
        }

        const action  = args[0]?.toLowerCase();
        const data    = loadToggle();
        const guildId = message.guildId;

        if (!action || action === "status") {
            const currently = isDisabled(guildId) ? t.disabled : t.enabled;
            return message.reply(`🤖 **${t.status}:** ${currently}`);
        }

        if (!["on", "off"].includes(action)) {
            return message.reply(`❌ Usage: \`aitoggle on\` or \`aitoggle off\``);
        }

        const turningOn = action === "on";

        if (turningOn) {
            delete data[guildId];
            message.client.aiDisabled?.delete(guildId);
        } else {
            data[guildId] = false;
            message.client.aiDisabled?.add(guildId);
        }

        saveToggle(data);

        await message.reply({ embeds: [
            new EmbedBuilder()
                .setColor(turningOn ? "#4CAF50" : "#FF6B6B")
                .setAuthor({ name: `angela ♡ | ${t.title}`, iconURL: message.client.user.displayAvatarURL() })
                .setTitle(turningOn ? "✅ AI Enabled" : "❌ AI Disabled")
                .setDescription(turningOn ? t.on : t.off)
        ]});
    },
};
