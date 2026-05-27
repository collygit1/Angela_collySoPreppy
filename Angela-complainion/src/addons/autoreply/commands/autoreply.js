const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const store  = require("../autoReplyStore");
const Embeds = require("../../../utils/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autoreply")
        .setDescription("✦ [Mod] Manage Angela's auto-response triggers for this server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub => sub
            .setName("add")
            .setDescription("Add a keyword trigger")
            .addStringOption(o => o.setName("keyword").setDescription("Trigger word/phrase").setRequired(true))
            .addStringOption(o => o.setName("response").setDescription("What Angela replies").setRequired(true))
            .addStringOption(o => o.setName("match")
                .setDescription("How to match (default: contains)")
                .addChoices(
                    { name: "contains (default)", value: "contains" },
                    { name: "exact match",         value: "exact"    },
                    { name: "starts with",         value: "startswith" },
                )))
        .addSubcommand(sub => sub
            .setName("remove")
            .setDescription("Remove a keyword trigger")
            .addStringOption(o => o.setName("keyword").setDescription("Trigger to remove").setRequired(true)))
        .addSubcommand(sub => sub
            .setName("list")
            .setDescription("List all triggers for this server"))
        .addSubcommand(sub => sub
            .setName("toggle")
            .setDescription("Enable or disable auto-replies")
            .addStringOption(o => o
                .setName("action")
                .setDescription("on or off")
                .setRequired(true)
                .addChoices({ name: "on", value: "on" }, { name: "off", value: "off" })))
        .addSubcommand(sub => sub
            .setName("cooldown")
            .setDescription("Set cooldown between auto-replies per user")
            .addIntegerOption(o => o
                .setName("seconds")
                .setDescription("Seconds between replies (1–60)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(60))),

    async execute(interaction) {
        const sub     = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const client  = interaction.client;

        if (sub === "toggle") {
            const on = interaction.options.getString("action") === "on";
            store.setEnabled(guildId, on);
            return interaction.reply({ embeds: [
                on  ? Embeds.success("auto-replies are now **on** for this server! ✨", client)
                    : Embeds.warn("auto-replies are now **off** for this server.", client),
            ]});
        }

        if (sub === "add") {
            const keyword  = interaction.options.getString("keyword");
            const response = interaction.options.getString("response");
            const match    = interaction.options.getString("match") ?? "contains";
            store.addTrigger(guildId, keyword, response, match);
            return interaction.reply({ embeds: [
                Embeds.success(`trigger added!\n\`${keyword}\` → *"${response}"* (${match})`, client),
            ], ephemeral: true });
        }

        if (sub === "remove") {
            const keyword = interaction.options.getString("keyword");
            const removed = store.removeTrigger(guildId, keyword);
            return interaction.reply({ embeds: [
                removed
                    ? Embeds.success(`removed trigger \`${keyword}\`.`, client)
                    : Embeds.error(`no trigger found for \`${keyword}\`.`, client),
            ], ephemeral: true });
        }

        if (sub === "cooldown") {
            const secs = interaction.options.getInteger("seconds");
            store.setCooldown(guildId, secs * 1000);
            return interaction.reply({ embeds: [
                Embeds.success(`auto-reply cooldown set to **${secs}s** per user.`, client),
            ], ephemeral: true });
        }

        if (sub === "list") {
            const cfg = store.getGuild(guildId);
            const desc = cfg.triggers.length === 0
                ? "*no triggers set yet! use `/autoreply add` to add one.*"
                : cfg.triggers.map(t =>
                    `**\`${t.keyword}\`** → *"${t.response}"* · (${t.match ?? "contains"})`
                ).join("\n");

            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor("#ffcad4")
                    .setAuthor({ name: "angela ♡ | auto-reply", iconURL: client.user.displayAvatarURL() })
                    .setTitle("✨ Auto-Reply Triggers")
                    .setDescription(desc)
                    .addFields(
                        { name: "Status",   value: cfg.enabled ? "✅ on" : "❌ off",  inline: true },
                        { name: "Cooldown", value: `${(cfg.cooldown ?? 10000) / 1000}s`, inline: true },
                    )
                    .setFooter({ text: "˚ʚ♡ɞ˚ autoreply · angela companion" })
                    .setTimestamp(),
            ], ephemeral: true });
        }
    },
};
