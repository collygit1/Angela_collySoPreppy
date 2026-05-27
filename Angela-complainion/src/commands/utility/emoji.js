const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'emoji',
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription("Retrieve a custom emoji from Angela's global network")
        .addStringOption(option =>
            option.setName('search')
                .setDescription('The name or ID of the emoji')
                .setRequired(true)
        ),

    async execute(interaction) {
        // Handshake: index.js likely already sent a "Syncing..." or similar deferral.
        // We use editReply to update that message.
        const lang = interaction.client.languages?.get(interaction.guildId) || 'en';
        const input = interaction.options.getString('search').toLowerCase();

        const local = {
            en: { found: "Protocol Success: Emoji located.", notFound: "❌ Error: Emoji not found in any linked sector." },
            ko: { found: "프로토콜 성공: 이모지를 찾았습니다.", notFound: "❌ 오류: 연결된 구역에서 이모지를 찾을 수 없습니다." },
            ja: { found: "プロトコル成功：絵文字が見つかりました。", notFound: "❌ エラー：絵文字が見つかりません。" },
            tl: { found: "Tagumpay: Nahanap na ang emoji.", notFound: "❌ Error: Hindi mahanap ang emoji." }
        };
        const t = local[lang] || local.en;

        try {
            const emoji = await findEmoji(interaction.client, input);

            if (!emoji) {
                return interaction.editReply({ content: t.notFound });
            }

            return interaction.editReply({ 
                content: `︰ 🌸 ﹕**${t.found}**\n${emoji}` 
            });
        } catch (err) {
            console.error("Emoji Protocol Error:", err);
            // This prevents the generic "Protocol Failure" from index.js by handling the error here
            return interaction.editReply({ 
                content: `⚠️ **Uplink Failure:** Could not stabilize connection to global clusters. \n\`${err.message}\`` 
            });
        }
    },

    async prefixExecute(message, args) {
        const input = args[0]?.toLowerCase();
        if (!input) return message.reply("︰ 🌸 ﹕Please provide an emoji name to scan.");

        try {
            const emoji = await findEmoji(message.client, input);
            if (!emoji) return message.reply("❌ Error: Emoji not found in database.");

            return message.reply(`︰ 🌸 ﹕**Success**\n${emoji}`);
        } catch (err) {
            return message.reply("⚠️ **System Error:** Failed to query clusters.");
        }
    }
};

/**
 * 📡 Global Search Logic
 * Optimized for discord-hybrid-sharding context
 */
async function findEmoji(client, input) {
    const normalizedInput = input.replace(/[\s_]/g, '');

    // 1. Check Local Cache (Fastest)
    const localEmoji = client.emojis.cache.get(input) || 
                       client.emojis.cache.find(e => e.name.toLowerCase() === input) ||
                       client.emojis.cache.find(e => e.name.toLowerCase().replace(/[\s_]/g, '').includes(normalizedInput));

    if (localEmoji) return localEmoji.toString();

    // 2. Broadcast Scan (Across all clusters)
    // We only attempt this if the cluster manager is actually initialized.
    if (client.cluster) {
        try {
            const results = await client.cluster.broadcastEval((c, { search, norm }) => {
                // This code runs on EVERY cluster. We search their local caches.
                const found = c.emojis.cache.get(search) || 
                              c.emojis.cache.find(e => e.name.toLowerCase() === search) ||
                              c.emojis.cache.find(e => e.name.toLowerCase().replace(/[\s_]/g, '').includes(norm));

                // We return the string version because full Emoji objects cannot be serialized.
                return found ? found.toString() : null;
            }, { context: { search: input, norm: normalizedInput } });

            // 'results' is an array [null, '<:emoji:id>', null...]. We find the first non-null.
            return results.find(res => res !== null);
        } catch (error) {
            console.error("BroadcastEval Failed:", error);
            return null;
        }
    }

    return null;
}