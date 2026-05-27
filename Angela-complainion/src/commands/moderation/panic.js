const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, GuildVerificationLevel } = require("discord.js");
const { lockdownGuild, logSecurity } = require("../../utils/securityActions");
const { bot } = require("../../config/settings");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("panic")
        .setDescription("Emergency: instantly lock server, max verification, and alert the owner.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    name: "panic",

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        const { guild } = interaction;

        await _doPanic(guild, interaction.user.tag, client);
        await interaction.editReply({ content: "🚨 Panic mode activated. Server locked, owner notified." });
    },

    async prefixExecute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
            return message.reply("❌ Administrator permission required.");
        await _doPanic(message.guild, message.author.tag, client);
        await message.reply("🚨 Panic mode activated.");
    }
};

async function _doPanic(guild, triggeredBy, client) {
    // 1. Lock all channels
    await lockdownGuild(guild, client, `PANIC MODE — triggered by ${triggeredBy}`);

    // 2. Set verification to maximum
    await guild.setVerificationLevel(GuildVerificationLevel.VeryHigh, "PANIC MODE").catch(() => {});

    // 3. DM the server owner
    try {
        const owner = await client.users.fetch(guild.ownerId);
        await owner.send(
            `🚨 **PANIC MODE** was activated in **${guild.name}**!\n` +
            `**Triggered by:** ${triggeredBy}\n\n` +
            `All channels have been locked and verification set to VERY HIGH.\n` +
            `Use \`/unlock\` in your server to restore it.`
        ).catch(() => {});
    } catch {}

    // 4. Also DM the bot owner if different
    if (guild.ownerId !== bot.owner) {
        try {
            const botOwner = await client.users.fetch(bot.owner);
            await botOwner.send(`🚨 **PANIC MODE** activated in **${guild.name}** by ${triggeredBy}.`).catch(() => {});
        } catch {}
    }

    // 5. Log the event
    const embed = new EmbedBuilder()
        .setColor("#FF4757")
        .setTitle("🚨 PANIC MODE ACTIVATED")
        .setDescription(
            `**Triggered by:** ${triggeredBy}\n\n` +
            `✅ All channels locked\n` +
            `✅ Verification set to **VERY HIGH**\n` +
            `✅ Server owner notified\n\n` +
            `Use \`/unlock\` to restore the server once the threat is clear.`
        )
        .setTimestamp();

    await logSecurity(client, guild.id, embed);
}
