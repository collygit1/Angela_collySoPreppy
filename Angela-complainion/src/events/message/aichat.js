const { Events } = require("discord.js");

const COOLDOWN_MS  = 3000;
const MAX_LINES    = 5;
const MAX_CHARS    = 800;

// Dynamic typing delay: 800ms base + 20ms per char, capped at 3s
function typingDelay(text) {
    return Math.min(3000, Math.max(800, text.length * 20));
}

function formatResponse(raw, maxLines = MAX_LINES) {
    let text = raw.trim();

    // Collapse 3+ consecutive blank lines into one
    text = text.replace(/\n{3,}/g, "\n\n");

    const lines = text.split("\n");

    if (lines.length > maxLines) {
        const truncated = lines.slice(0, maxLines).join("\n").trimEnd();
        // Try to cut at the last sentence boundary
        const lastPunct = Math.max(
            truncated.lastIndexOf(". "),
            truncated.lastIndexOf("! "),
            truncated.lastIndexOf("? "),
            truncated.lastIndexOf("~ "),
        );
        text = lastPunct > MAX_CHARS * 0.4 ? truncated.slice(0, lastPunct + 1) : truncated;
    } else {
        text = lines.join("\n").trimEnd();
    }

    // Hard character cap — trim to last word boundary
    if (text.length > MAX_CHARS) {
        text = text.slice(0, MAX_CHARS);
        const lastSpace = text.lastIndexOf(" ");
        if (lastSpace > MAX_CHARS * 0.7) text = text.slice(0, lastSpace);
        text = text.trimEnd() + "…";
    }

    return text;
}

module.exports = {
    name: Events.MessageCreate,

    async execute(message, client) {
        if (message.author.bot || !message.guild || !client.aiModel) return;

        // Guild-level AI toggle
        if (client.aiDisabled?.has(message.guildId)) return;

        const isMentioned = message.mentions.has(client.user);
        const isAiChannel = client.aiChannels.has(message.channel.id);

        // Outside an AI channel — only respond to @mentions or reply-chains
        if (!isAiChannel && !isMentioned) {
            if (message.reference?.messageId) {
                const referenced = await message.channel.messages
                    .fetch(message.reference.messageId)
                    .catch(() => null);
                if (referenced?.author?.id !== client.user.id) return;
            } else {
                return;
            }
        }

        // 3-second per-user cooldown
        const now      = Date.now();
        const lastUsed = client.aiCooldowns?.get(message.author.id) || 0;
        if (now - lastUsed < COOLDOWN_MS) return;
        client.aiCooldowns?.set(message.author.id, now);

        // Per-server AI settings
        const guildCfg  = client.aiSettings?.get(message.guildId) || {};
        const maxLines   = guildCfg.maxLines || MAX_LINES;
        const personalityNote = guildCfg.personality || null;

        // Start typing indicator — refresh every 7s (indicator lasts 10s)
        message.channel.sendTyping().catch(() => {});
        const typingInterval = setInterval(() => {
            message.channel.sendTyping().catch(() => {});
        }, 7000);

        try {
            const history  = client.aiMemory.get(message.author.id) || [];
            const userText = `[User: ${message.author.username}] ${message.content}`;

            // Inject per-server personality as a leading context exchange
            const personalityCtx = personalityNote
                ? [
                    { role: "user",  parts: [{ text: `[Server personality note: ${personalityNote}]` }] },
                    { role: "model", parts: [{ text: "Got it, I'll keep that in mind ♡" }] },
                  ]
                : [];

            const result = await client.aiModel.generateContent({
                contents: [...personalityCtx, ...history, { role: "user", parts: [{ text: userText }] }],
            });

            const raw = result.response.text();

            // Realistic typing delay based on response length (1–3s)
            await new Promise(r => setTimeout(r, typingDelay(raw)));

            clearInterval(typingInterval);

            const response = formatResponse(raw, maxLines);

            // Store raw text in memory so context is always full quality
            history.push({ role: "user",  parts: [{ text: message.content }] });
            history.push({ role: "model", parts: [{ text: raw }] });
            if (history.length > 10) history.splice(0, 2);
            client.aiMemory.set(message.author.id, history);

            await message.reply({ content: response });

        } catch (err) {
            clearInterval(typingInterval);
            if (err?.status === 429 || err?.status === 503) {
                await message.reply("a little overloaded rn~ try again in a sec! ♡").catch(() => {});
            } else {
                console.error("AI Chat Error:", err);
            }
        }
    },
};
