const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const store = require("../../database/securityStore");
const { colors } = require("../../config/settings");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("Manage users who are auto-banned on join.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(s => s.setName("add").setDescription("Add a user to the blacklist")
            .addUserOption(o => o.setName("user").setDescription("User to blacklist").setRequired(true))
            .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(false)))
        .addSubcommand(s => s.setName("remove").setDescription("Remove a user from the blacklist")
            .addUserOption(o => o.setName("user").setDescription("User to remove").setRequired(true)))
        .addSubcommand(s => s.setName("list").setDescription("View all blacklisted users")),

    name: "blacklist",

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const gid = interaction.guild.id;

        if (sub === "add") {
            const user   = interaction.options.getUser("user");
            const reason = interaction.options.getString("reason") || "No reason provided";
            store.addBlacklist(gid, user.id);
            return interaction.reply({ content: `🚫 **${user.tag}** added to the blacklist.\n**Reason:** ${reason}`, ephemeral: true });
        }

        if (sub === "remove") {
            const user = interaction.options.getUser("user");
            store.removeBlacklist(gid, user.id);
            return interaction.reply({ content: `✅ **${user.tag}** removed from the blacklist.`, ephemeral: true });
        }

        if (sub === "list") {
            const cfg  = store.guild(gid);
            const list = cfg.blacklist.length
                ? cfg.blacklist.map((id, i) => `\`${i + 1}.\` <@${id}> (\`${id}\`)`).join("\n")
                : "*No users blacklisted.*";

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor("#FF4757")
                    .setTitle("angela ♡ | Security Blacklist")
                    .setDescription(list)
                    .setFooter({ text: `${cfg.blacklist.length} user(s) blacklisted · angela` })
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
            store.addBlacklist(gid, user.id);
            return message.reply(`🚫 **${user.tag}** blacklisted.`);
        }
        if (sub === "remove") {
            const user = message.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);
            if (!user) return message.reply("Mention a user or provide their ID.");
            store.removeBlacklist(gid, user.id);
            return message.reply(`✅ **${user.tag}** removed from the blacklist.`);
        }
        if (sub === "list") {
            const cfg = store.guild(gid);
            return message.reply(cfg.blacklist.length ? cfg.blacklist.map(id => `<@${id}>`).join(", ") : "No users blacklisted.");
        }
        return message.reply("Usage: `blacklist add/remove/list`");
    }
};
