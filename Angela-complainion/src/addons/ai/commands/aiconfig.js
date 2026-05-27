const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs   = require("fs");
const path = require("path");

const SETTINGS_PATH = path.join(process.cwd(), "src", "database", "json", "ai_settings.json");

function load() {
    try { return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8") || "{}"); } catch { return {}; }
}
function save(data) {
    try { fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2)); } catch {}
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("aiconfig")
        .setDescription("✦ Customize Angela's AI behavior for this server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub => sub
            .setName("personality")
            .setDescription("Set a custom personality note Angela follows in this server")
            .addStringOption(o => o
                .setName("text")
                .setDescription("Personality instruction (max 200 chars). Use 'reset' to clear.")
                .setRequired(true)
                .setMaxLength(200)))
        .addSubcommand(sub => sub
            .setName("length")
            .setDescription("Set the max reply length (lines) for this server")
            .addIntegerOption(o => o
                .setName("lines")
                .setDescription("Max lines per reply (1–5)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(5)))
        .addSubcommand(sub => sub
            .setName("reset")
            .setDescription("Reset all AI settings for this server to defaults"))
        .addSubcommand(sub => sub
            .setName("status")
            .setDescription("Show current AI config for this server")),

    async execute(interaction) {
        const sub     = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const data    = load();
        if (!data[guildId]) data[guildId] = {};

        if (sub === "status") {
            const cfg = data[guildId] || {};
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#ffcad4")
                    .setAuthor({ name: "angela ♡ | AI Config", iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("⚙️ Server AI Settings")
                    .addFields(
                        { name: "🎭 Personality Override", value: cfg.personality || "*not set — using default*", inline: false },
                        { name: "📏 Max Reply Lines",       value: String(cfg.maxLines || 5) + " lines", inline: true },
                    )
                    .setFooter({ text: "˚ʚ♡ɞ˚ aiconfig · angela" })
                    .setTimestamp()
            ], ephemeral: true });
        }

        if (sub === "personality") {
            const text = interaction.options.getString("text");
            if (text.toLowerCase() === "reset") {
                delete data[guildId].personality;
            } else {
                data[guildId].personality = text;
            }
            save(data);
            interaction.client.aiSettings?.set(guildId, data[guildId]);
            const cleared = text.toLowerCase() === "reset";
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor(cleared ? "#FF6B6B" : "#4CAF50")
                    .setAuthor({ name: "angela ♡ | AI Config", iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle(cleared ? "🔄 Personality Reset" : "🎭 Personality Updated")
                    .setDescription(cleared ? "Personality override cleared. Using Angela's default personality." : `**New personality note:**\n${text}`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ aiconfig · angela" })
                    .setTimestamp()
            ]});
        }

        if (sub === "length") {
            const lines = interaction.options.getInteger("lines");
            data[guildId].maxLines = lines;
            save(data);
            interaction.client.aiSettings?.set(guildId, data[guildId]);
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#4CAF50")
                    .setAuthor({ name: "angela ♡ | AI Config", iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("📏 Reply Length Updated")
                    .setDescription(`Angela will now reply in **${lines} line${lines === 1 ? "" : "s"}** max for this server.`)
                    .setFooter({ text: "˚ʚ♡ɞ˚ aiconfig · angela" })
                    .setTimestamp()
            ]});
        }

        if (sub === "reset") {
            delete data[guildId];
            save(data);
            interaction.client.aiSettings?.delete(guildId);
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#FF6B6B")
                    .setAuthor({ name: "angela ♡ | AI Config", iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle("🔄 AI Config Reset")
                    .setDescription("All AI settings for this server have been reset to defaults.")
                    .setFooter({ text: "˚ʚ♡ɞ˚ aiconfig · angela" })
                    .setTimestamp()
            ]});
        }
    },
};
