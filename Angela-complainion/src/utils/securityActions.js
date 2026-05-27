const { EmbedBuilder } = require("discord.js");
const store = require("../database/securityStore");

// Send an embed to the guild's configured security log channel.
async function logSecurity(client, guildId, embed) {
    const cfg = store.guild(guildId);
    if (!cfg.logChannel) return;
    const ch = await client.channels.fetch(cfg.logChannel).catch(() => null);
    if (ch?.isTextBased()) await ch.send({ embeds: [embed] }).catch(() => {});
}

// Strip all roles from a member and apply a max-duration timeout.
async function quarantineUser(guild, member, reason, client) {
    try {
        const roles = member.roles.cache.filter(r => r.id !== guild.id && !r.managed);
        await member.roles.remove(roles, reason).catch(() => {});
        await member.timeout(28 * 24 * 60 * 60 * 1000, reason).catch(() => {});
    } catch {}

    const embed = new EmbedBuilder()
        .setColor("#FF4757")
        .setTitle("🚨 User Quarantined")
        .addFields(
            { name: "User",   value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
            { name: "Reason", value: reason,                                   inline: true },
        )
        .setTimestamp();

    await logSecurity(client, guild.id, embed);
}

// Lock all text channels in the guild by denying @everyone send permissions.
async function lockdownGuild(guild, client, reason = "Security lockdown") {
    store.setLockdown(guild.id, true);
    const everyone = guild.roles.everyone;
    let locked = 0;

    for (const [, ch] of guild.channels.cache) {
        if (!ch.isTextBased()) continue;
        await ch.permissionOverwrites.edit(
            everyone,
            { SendMessages: false, AddReactions: false },
            { reason }
        ).catch(() => {});
        locked++;
    }

    const embed = new EmbedBuilder()
        .setColor("#FF4757")
        .setTitle("🔒 Server Lockdown Activated")
        .setDescription(`**Reason:** ${reason}\n**Channels locked:** ${locked}`)
        .setTimestamp();

    await logSecurity(client, guild.id, embed);
}

// Restore @everyone send permissions on all text channels.
async function unlockGuild(guild, client) {
    store.setLockdown(guild.id, false);
    const everyone = guild.roles.everyone;

    for (const [, ch] of guild.channels.cache) {
        if (!ch.isTextBased()) continue;
        await ch.permissionOverwrites.edit(
            everyone,
            { SendMessages: null, AddReactions: null }
        ).catch(() => {});
    }

    const embed = new EmbedBuilder()
        .setColor("#2ED573")
        .setTitle("🔓 Server Unlocked")
        .setDescription("All channels have been restored to normal.")
        .setTimestamp();

    await logSecurity(client, guild.id, embed);
}

module.exports = { logSecurity, quarantineUser, lockdownGuild, unlockGuild };
