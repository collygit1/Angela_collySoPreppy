const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const profanityPath = path.join(process.cwd(), "src", "database", "json", "profanity.json");

const LOCAL = {
    en: { immune: "Immune", scanned: "Scanned", added: "Added to Angel list", removed: "Removed from Angel list", set: "Angel Protocol set to" },
    tl: { immune: "Hindi Ma-scan", scanned: "Nai-scan", added: "Idinagdag sa Angel list", removed: "Tinanggal mula sa Angel list", set: "Angel Protocol naka-set sa" },
    ko: { immune: "면역", scanned: "스캔됨", added: "Angel 목록에 추가됨", removed: "Angel 목록에서 제거됨", set: "Angel 프로토콜 설정됨" },
    ja: { immune: "免疫", scanned: "スキャン済み", added: "Angelリストに追加済み", removed: "Angelリストから削除済み", set: "Angelプロトコル設定済み" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("angels")
        .setDescription("✦ [Admin] Manage Angel immunity whitelist")
        .addSubcommand(s => s.setName("status").setDescription("Toggle Angel immunity ON/OFF")
            .addBooleanOption(o => o.setName("active").setDescription("True = Immune, False = Scanned").setRequired(true)))
        .addSubcommand(s => s.setName("whitelist").setDescription("Add or remove from Angel list")
            .addStringOption(o => o.setName("action").setDescription("Add or Remove").setRequired(true)
                .addChoices({ name: "Add", value: "add" }, { name: "Remove", value: "remove" }))
            .addStringOption(o => o.setName("id").setDescription("The User ID").setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const lang = client.languages?.get(interaction.guildId) || "en";
        const t = LOCAL[lang] || LOCAL.en;
        const sub = interaction.options.getSubcommand();
        let config = JSON.parse(fs.readFileSync(profanityPath, "utf8"));

        if (sub === "status") {
            const active = interaction.options.getBoolean("active");
            config.settings.angels_enabled = active;
            this.saveAndSync(config, client);
            const embed = new EmbedBuilder().setColor("#ffcad4")
                .setAuthor({ name: "angela ♡ | angel protocol", iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(`⊹ ─────────────────── ⊹\n👼 **${t.set}:** \`${active ? t.immune : t.scanned}\`\n⊹ ─────────────────── ⊹`)
                .setFooter({ text: `˚ʚ♡ɞ˚ angels · angela · ${lang.toUpperCase()}` });
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (sub === "whitelist") {
            const action = interaction.options.getString("action");
            const targetId = interaction.options.getString("id").replace(/[^\d]/g, "");
            if (action === "add") {
                if (!config.settings.whitelistedUsers.includes(targetId)) config.settings.whitelistedUsers.push(targetId);
            } else {
                config.settings.whitelistedUsers = config.settings.whitelistedUsers.filter(id => id !== targetId);
            }
            this.saveAndSync(config, client);
            const embed = new EmbedBuilder().setColor("#ffcad4")
                .setAuthor({ name: "angela ♡ | angel protocol", iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(`⊹ ─────────────────── ⊹\n👼 **${action === "add" ? t.added : t.removed}:** \`${targetId}\`\n⊹ ─────────────────── ⊹`)
                .setFooter({ text: `˚ʚ♡ɞ˚ angels · angela · ${lang.toUpperCase()}` });
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },

    saveAndSync(config, client) {
        fs.writeFileSync(profanityPath, JSON.stringify(config, null, 2));
        client.configCache = config;
    }
};
