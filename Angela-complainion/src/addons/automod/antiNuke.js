const { AuditLogEvent, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const store = require("../../database/securityStore");
const { quarantineUser, lockdownGuild, logSecurity } = require("../../utils/securityActions");
const { isTrustedExecutor } = require("../../utils/permissions");

const NUKE_ACTIONS = new Set([
    AuditLogEvent.ChannelCreate,
    AuditLogEvent.ChannelDelete,
    AuditLogEvent.RoleCreate,
    AuditLogEvent.RoleDelete,
    AuditLogEvent.MemberBanAdd,
    AuditLogEvent.MemberKick,
]);

const ACTION_LABELS = {
    [AuditLogEvent.ChannelCreate]: "Channel Create",
    [AuditLogEvent.ChannelDelete]: "Channel Delete",
    [AuditLogEvent.RoleCreate]:    "Role Create",
    [AuditLogEvent.RoleDelete]:    "Role Delete",
    [AuditLogEvent.MemberBanAdd]:  "Mass Ban",
    [AuditLogEvent.MemberKick]:    "Mass Kick",
};

// Permissions that should never be granted by non-owners
const DANGEROUS_PERMS = [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageWebhooks,
    PermissionFlagsBits.ManageChannels,
];

// Monitor audit logs for rapid destructive actions and dangerous permission grants.
async function checkNuke(entry, guild, client) {
    if (!guild) return;

    const cfg = store.guild(guild.id);
    const { action, executorId, targetId } = entry;

    if (!executorId) return;
    if (isTrustedExecutor(executorId, guild, client)) return;

    // Anti-Nuke: detect rapid channel/role deletions, mass bans/kicks
    if (cfg.config.antiNuke.enabled && NUKE_ACTIONS.has(action)) {
        const { threshold, window } = cfg.config.antiNuke;
        const gMap = client.security.nukeTrackers.get(guild.id) || new Map();
        client.security.nukeTrackers.set(guild.id, gMap);

        const ud  = gMap.get(executorId) || { timestamps: [] };
        const now = Date.now();
        ud.timestamps = ud.timestamps.filter(t => now - t < window);
        ud.timestamps.push(now);
        gMap.set(executorId, ud);

        if (ud.timestamps.length >= threshold) {
            gMap.set(executorId, { timestamps: [] }); // reset counter

            const label  = ACTION_LABELS[action] || "Unknown";
            const member = await guild.members.fetch(executorId).catch(() => null);

            const alert = new EmbedBuilder()
                .setColor("#FF4757")
                .setTitle("🚨 ANTI-NUKE TRIGGERED")
                .setDescription(
                    `**Executor:** <@${executorId}> (\`${executorId}\`)\n` +
                    `**Action:** ${label} × ${ud.timestamps.length}\n` +
                    `**Threshold:** ${threshold} in ${window / 1000}s`
                )
                .setTimestamp();

            await logSecurity(client, guild.id, alert);
            if (member) await quarantineUser(guild, member, `Anti-Nuke: ${label} × ${ud.timestamps.length}`, client);
            if (!cfg.lockdown) await lockdownGuild(guild, client, `Anti-Nuke triggered by ${executorId}`);
            return;
        }
    }

    // Permissions Guard: auto-revert dangerous permission grants on roles
    if (action === AuditLogEvent.RoleCreate || action === AuditLogEvent.RoleUpdate) {
        const permChange = (entry.changes || []).find(c => c.key === "permissions");
        if (!permChange) return;

        const newPerms  = BigInt(permChange.new || 0);
        const hasDanger = DANGEROUS_PERMS.some(p => (newPerms & p) === p);
        if (!hasDanger) return;

        const role = guild.roles.cache.get(targetId);
        if (role) {
            let safe = newPerms;
            for (const p of DANGEROUS_PERMS) safe &= ~p;
            await role.setPermissions(safe, "PermGuard: Dangerous permissions removed").catch(() => {});
        }

        const alert = new EmbedBuilder()
            .setColor("#FFA502")
            .setTitle("⚠️ Permissions Guard")
            .setDescription(
                `**Executor:** <@${executorId}>\n` +
                `**Role:** ${role ? `<@&${targetId}>` : `\`${targetId}\``}\n` +
                `**Dangerous permissions detected and automatically reverted.**`
            )
            .setTimestamp();

        await logSecurity(client, guild.id, alert);
    }
}

module.exports = { checkNuke };
