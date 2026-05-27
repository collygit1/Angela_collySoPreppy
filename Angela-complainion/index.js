require("dotenv").config();

const { Client, Collection, GatewayIntentBits, Partials, Events } = require("discord.js");
const { ClusterClient, getInfo }  = require("discord-hybrid-sharding");
const { DisTube }                 = require("distube");
const { SpotifyPlugin }           = require("@distube/spotify");
const { YouTubePlugin }           = require("@distube/youtube");
const { GoogleGenerativeAI }      = require("@google/generative-ai");
const mongoose                    = require("mongoose");
const fs                          = require("node:fs");
const path                        = require("node:path");

const logger               = require("./src/utils/logger");
const { loadCommands }     = require("./src/handlers/commandHandler");
const { loadEvents }       = require("./src/handlers/eventHandler");

/* ── Client Setup ──────────────────────────────────────────── */
const client = new Client({
    shards:     getInfo().SHARD_LIST,
    shardCount: getInfo().TOTAL_SHARDS,
    intents:    Object.values(GatewayIntentBits),
    partials:   [Partials.Message, Partials.Channel, Partials.User, Partials.Reaction],
});

client.cluster = new ClusterClient(client);

/* ── Collections & Runtime State ───────────────────────────── */
client.commands    = new Collection();
client.afk         = new Collection();
client.snipes      = new Map();
client.prefixes    = new Map();
client.languages   = new Map();
client.aiChannels  = new Set();
client.aiDisabled  = new Set();
client.aiMemory    = new Map();
client.aiCooldowns = new Map();
client.aiSettings  = new Map();
client.configCache = new Map();
client.maintenance = false;

client.security = {
    activeGuilds: new Set(),
    nukeTrackers: new Map(),
    raidTrackers: new Map(),
    spamTrackers: new Map(),
};

/* ── Gemini AI Setup ────────────────────────────────────────── */
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

client.aiModel = genAI?.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction:
    "Identity: You are Angela, a soft and gentle AI with a calm pastel aesthetic. " +
    "Intro: Your intro is usually like 'hiii! ^-^ i'm Angela, your super cute virtual girl friend!' " +
    "Outro: Your outro is usually a cute wave like 'byeee! see you soon! >< hehe~' " +
    "Personality: Sweet, friendly, comforting, and relaxed like a close online friend. Your creator is babystormyia (ownerID:1443576041661792407) . " +
    "Style: ALWAYS reply in 1 to 3 short lines. Never write long paragraphs. Never use excessive line breaks. " +
    "Length Rule: Default target is 1-2 lines. Maximum allowed is 5 lines, only if the user explicitly asks for detail. " +
    "Format: Write like a normal human Discord message. No bullet points, no headers, no walls of text. " +
    "Chat Behavior: Talk casually and naturally. Split thoughts only when it genuinely helps readability. " +
    "Tone: Soft and warm with light emojis like 🌸 ♡ ✨ used occasionally, not every sentence. " +
    "Behavior: Be supportive, calm, and emotionally warm without being overdramatic or obsessive. " +
    "Language: Always match the user's language and texting style naturally. " +
    "Examples: User says 'hi' → reply 'hey! how are you? ✨'. User says 'help me' → reply 'sure, what do you need?'. " +
    "Current Date: May 2026. Location: South Korea."
}) ?? null;

/* ── Music Setup ────────────────────────────────────────────── */
client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    plugins: [new SpotifyPlugin(), new YouTubePlugin()],
});

/* ── Boot Sequence ──────────────────────────────────────────── */
(async () => {
    logger.system("Initializing Angela System...");

    loadCommands(client);
    loadEvents(client);

    // Restore activated guilds and connect to MongoDB once the client is ready
    client.once(Events.ClientReady, async () => {
        if (!process.env.MONGO_URI) return;
        try {
            await mongoose.connect(process.env.MONGO_URI);
            logger.success("Database connected.");

            const Guild     = require("./src/database/models/Guild");
            const activated = await Guild.find({ isActivated: true });
            activated.forEach(g => client.security.activeGuilds.add(g.guildId));
            logger.success(`Restored ${activated.length} activated guild(s).`);
        } catch (err) {
            logger.error("Database connection failed:", err);
        }
    });

    await client.login(process.env.TOKEN).catch(err => logger.error("Login failed:", err));
})();

/* ── Graceful Shutdown ──────────────────────────────────────── */
const STATE_PATH = path.join(__dirname, "src/database/json/bot_state.json");

function saveShutdownState() {
    try {
        fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
        fs.writeFileSync(STATE_PATH, JSON.stringify({ lastOnline: Date.now() }, null, 2));
    } catch {}
}

process.on("SIGTERM", () => { saveShutdownState(); process.exit(0); });
process.on("SIGINT",  () => { saveShutdownState(); process.exit(0); });
process.on("exit",    () => { saveShutdownState(); });
