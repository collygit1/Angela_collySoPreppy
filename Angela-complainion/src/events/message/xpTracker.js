const { Events, EmbedBuilder } = require("discord.js");
const { addXp, isDisabled, getRoles } = require("../../addons/leveling/levelStore");

const COOLDOWN_MS = 60_000;
const XP_MIN      = 15;
const XP_MAX      = 25;

function randomXp() {
    return Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
}

module.exports = {
    name: Events.MessageCreate,

    async execute(message, client) {
        if (message.author.bot || !message.guild) return;
        if (isDisabled(message.guildId))           return;
        if (message.content.startsWith(client.prefixes?.get(message.guildId) || "Angela^")) return;

        const key = `${message.guildId}:${message.author.id}`;
        const now = Date.now();

        if (client.levelCooldowns?.has(key)) {
            if (now - client.levelCooldowns.get(key) < COOLDOWN_MS) return;
        }
        client.levelCooldowns?.set(key, now);

        const result = addXp(message.guildId, message.author.id, randomXp());

        if (!result.leveled) return;

        // Level-up message
        const embed = new EmbedBuilder()
            .setColor("#ffcad4")
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setDescription(`✨ **level up!** you're now **level ${result.newLevel}** ${message.author} ♡`)
            .setFooter({ text: "˚ʚ♡ɞ˚ leveling · angela companion" })
            .setTimestamp();

        message.channel.send({ embeds: [embed] }).catch(() => {});

        // Role reward
        const roles = getRoles(message.guildId);
        const roleId = roles[String(result.newLevel)];
        if (roleId) {
            const member = message.member ?? await message.guild.members.fetch(message.author.id).catch(() => null);
            if (member) {
                const role = message.guild.roles.cache.get(roleId);
                if (role && member.manageable) {
                    await member.roles.add(role).catch(() => {});
                }
            }
        }
    },
};
