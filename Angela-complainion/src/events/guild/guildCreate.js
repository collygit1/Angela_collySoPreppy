const { Events, EmbedBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const { GUILD_BLACKLIST_KEYWORDS } = require("../../config/constants");

const DECORATIVE_LINE = "⎯".repeat(47);

module.exports = {
    name: Events.GuildCreate,

    async execute(guild) {
        try {
            if (!guild?.available) return;

            // Auto-leave servers with explicitly NSFW-themed names only
            const isUnsafe =
                GUILD_BLACKLIST_KEYWORDS.some(w => guild.name.toLowerCase().includes(w));

            if (isUnsafe) {
                console.log(`[Security] Leaving unsafe guild: ${guild.name}`);
                return guild.leave().catch(() => null);
            }

            // Find a writable text channel to send the welcome message
            const channel = guild.channels.cache.find(c =>
                c.type === ChannelType.GuildText &&
                guild.members.me.permissionsIn(c).has([
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                ])
            ) || guild.systemChannel;

            if (!channel) return;

            const welcomeEmbed = new EmbedBuilder()
                .setColor("#FFB6C1")
                .setAuthor({ name: "ANGELA OPERATING SYSTEM", iconURL: guild.client.user.displayAvatarURL() })
                .setTitle("⋆｡˚꒰ঌ 𝐍𝐞𝐮𝐫𝐚𝐥 𝐋𝐢𝐧𝐤 𝐄𝐬𝐭𝐚𝐛𝐥𝐢𝐬𝐡𝐞𝐝 ໒꒱˚｡⋆")
                .setDescription(
                    `${DECORATIVE_LINE}\n` +
                    `### ִ ࣪ ˖ 𝐰𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 **${guild.name.toUpperCase()}** ! ᰔ\n` +
                    `All systems are online and ready.\n\n` +
                    `> **𝟎𝟏. 𝐓𝐄𝐑𝐌𝐒 𝐎𝐅 𝐒𝐄𝐑𝐕𝐈𝐂𝐄**\n` +
                    "```diff\n" +
                    "+ No malicious toxicity or harassment.\n" +
                    "+ Strict zero-tolerance for NSFW/Adult content.\n" +
                    "+ Adherence to Discord TOS is mandatory.\n" +
                    "+ No exploitation, doxxing, or malicious intent.\n" +
                    "```\n" +
                    `> **Status:** \`Operational\`\n` +
                    `${DECORATIVE_LINE}`
                )
                .setFooter({ text: "Angela OS • All systems active" })
                .setTimestamp();

            await channel.send({ embeds: [welcomeEmbed] }).catch(() => null);

        } catch (err) {
            console.error("[GuildCreate] Error:", err);
        }
    },
};
