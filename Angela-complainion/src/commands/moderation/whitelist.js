const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const store = require("../../database/securityStore");
const { colors } = require("../../config/settings");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("whitelist")
        .setDescription("Manage users who bypass security checks.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(s => s.setName("add").setDescription("Add a user to the whitelist")
            .addUserOption(o => o.setName("user").setDescription("User to whitelist").setRequired(true)))
        .addSubcommand(s => s.setName("remove").setDescription("Remove a user from the whitelist")
            .addUserOption(o => o.setName("user").setDescription("User to remove").setRequired(true)))
        .addSubcommand(s => s.setName("list").setDescription("View all whitelisted users")),

    name: "whitelist",

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const gid = interaction.guild.id;

        if (sub === "add") {
            const user = interaction.options.getUser("user");
            store.addWhitelist(gid, user.id);
            return interaction.reply({ content: `✅ **${user.tag}** added to the security whitelist.`, ephemeral: true });
        }

        if (sub === "remove") {
            const user = interaction.options.getUser("user");
            store.removeWhitelist(gid, user.id);
            return interaction.reply({ content: `✅ **${user.tag}** removed from the whitelist.`, ephemeral: true });
        }

        if (sub === "list") {
            const cfg = store.guild(gid);
            const list = cfg.whitelist.length
                ? cfg.whitelist.map((id, i) => `\`${i + 1}.\` <@${id}>`).join("\n")
                : "*No users whitelisted.*";

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(colors.pink)
                    .setTitle("angela ♡ | Security Whitelist")
                    .setDescription(list)
                    .setFooter({ text: `${cfg.whitelist.length} user(s) whitelisted · angela` })
                    .setTimestamp()],
                ephemeral: true
            });
        }
    },

    async prefixExecute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
            return message.reply("❌ Administrator permission required.");

        const sub = args[0];
        const gid = message.guild.id;

        if (sub === "add") {
            const user = message.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);
            if (!user) return message.reply("Mention a user or provide their ID.");
            store.addWhitelist(gid, user.id);
            return message.reply(`✅ **${user.tag}** added to the whitelist.`);
        }
        if (sub === "remove") {
            const user = message.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);
            if (!user) return message.reply("Mention a user or provide their ID.");
            store.removeWhitelist(gid, user.id);
            return message.reply(`✅ **${user.tag}** removed from the whitelist.`);
        }
        if (sub === "list") {
            const cfg = store.guild(gid);
            return message.reply(cfg.whitelist.length ? cfg.whitelist.map(id => `<@${id}>`).join(", ") : "No users whitelisted.");
        }
        return message.reply("Usage: `whitelist add/remove/list`");
    }
};
