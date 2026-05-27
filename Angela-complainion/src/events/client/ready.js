const { ActivityType, Events, version } = require("discord.js");
const chalk = require("chalk");
const fs    = require("node:fs");
const path  = require("node:path");

const afkPath   = path.join(__dirname, "../../database/json/afk.json");
const statePath = path.join(__dirname, "../../database/json/bot_state.json");

const MAX_AFK_MS  = 24 * 60 * 60 * 1000; // clear AFK entries older than 24h
const OFFLINE_MIN = 30 * 60 * 1000;       // treat as "long offline" after 30 min

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function typewriter(text, delay = 8) {
    for (const char of text) {
        process.stdout.write(char);
        await wait(delay);
    }
    process.stdout.write("\n");
}

module.exports = {
    name: Events.ClientReady, // emits as 'clientReady' in discord.js v14+
    once: true,

    async execute(client) {
        const pink = chalk.hex("#FF69B4");
        const red  = chalk.red;

        process.stdout.write("\x1Bc");

        const header = [
            "          𐔌  ୨୧  ໒ྀི  𐙚  ೀ  ౨ৎ  🎀  ☾  ✧  𓉸",
            "          ୨୧┈━┈━┈━┈━┈━┈━┈━┈━┈━┈━┈━┈━┈━┈━┈═",
            "          ♱  ANGELA OS v2.6  ♱",
            "          ═┈━┈━┈━┈━┈━┈━┈━┈━┈━┈━┈━┈━┈━┈━┈═",
        ];
        for (const line of header) { console.log(pink(line)); await wait(80); }

        const kitty = ["             /\\_/\\  ", "            ( o.o ) ", "             > ^ <  "];
        for (const line of kitty) { console.log(chalk.white(line)); await wait(120); }

        await typewriter(pink(
            `    𓏵 [TAG]: ${client.user.tag}  𓏵 [LATENCY]: ${client.ws.ping}ms  𓏵 [API]: v${version}`
        ), 5);

        await wait(200);
        console.log(pink(`\n    𐙚─────────────────────────❥ [📂 angela_system ]`));
        await typewriter(chalk.gray(`    ೀ  commands │ ${client.commands.size} loaded`), 8);
        await typewriter(chalk.gray(`    ೀ  status   │ Online & Operational`), 8);

        const barLength = 20;
        for (let i = 0; i <= barLength; i++) {
            const pct = Math.round((i / barLength) * 100);
            const bar = "❤".repeat(i) + " ".repeat(barLength - i);
            process.stdout.write(`\r    ${red("౨ৎ")} ${chalk.white(`[${bar}]`)} ${red(`${pct}%`)} `);
            await wait(60);
        }

        console.log(`\n\n    ${red.bold("✘ ANGELA AWAKENED")}`);
        console.log(pink(`    ‹3 .ᐟ owner :evanescia`));
        console.log(chalk.white(`    ‹3 .ᐟ discord.gg/J4PTZW6BM`));

        // Set bot presence
        client.user.setPresence({
            activities: [{
                name: "i am angela >.<",
                type: ActivityType.Streaming,
                url: "https://www.twitch.tv/angela",
            }],
            status: "online",
        });

        // Purge stale AFK entries that are older than 24h or predate a long offline period
        try {
            fs.mkdirSync(path.dirname(afkPath), { recursive: true });

            const state      = fs.existsSync(statePath)
                ? JSON.parse(fs.readFileSync(statePath, "utf8") || "{}")
                : {};
            const lastOnline    = state.lastOnline || 0;
            const now           = Date.now();
            const offlineFor    = now - lastOnline;
            const wasLongOffline = lastOnline > 0 && offlineFor > OFFLINE_MIN;

            if (fs.existsSync(afkPath)) {
                const afkRaw = JSON.parse(fs.readFileSync(afkPath, "utf8") || "{}");
                let changed  = false;

                for (const [userId, entry] of Object.entries(afkRaw)) {
                    const age            = now - (entry.time || 0);
                    const setBeforeOffline = lastOnline > 0 && entry.time < lastOnline;

                    if (age > MAX_AFK_MS || (wasLongOffline && setBeforeOffline)) {
                        delete afkRaw[userId];
                        client.afk.delete(userId);
                        changed = true;
                    }
                }

                if (changed) fs.writeFileSync(afkPath, JSON.stringify(afkRaw, null, 2));
            }

            fs.writeFileSync(statePath, JSON.stringify({ lastOnline: now }, null, 2));
        } catch (err) {
            console.error(chalk.red("    [AFK] Cleanup error:"), err.message);
        }

        // Restore prefix + language settings from disk into memory Maps
        const prefixPath = path.join(__dirname, "../../database/json/prefixes.json");
        const langPath   = path.join(__dirname, "../../database/json/serverlanguage.json");

        try {
            if (fs.existsSync(prefixPath)) {
                const prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf8") || "{}");
                for (const [gid, pfx] of Object.entries(prefixes)) client.prefixes.set(gid, pfx);
            }
        } catch (err) { console.error(chalk.red("    [PREFIX] Load error:"), err.message); }

        try {
            if (fs.existsSync(langPath)) {
                const langs = JSON.parse(fs.readFileSync(langPath, "utf8") || "{}");
                for (const [gid, lang] of Object.entries(langs)) client.languages.set(gid, lang);
            }
        } catch (err) { console.error(chalk.red("    [LANG] Load error:"), err.message); }

        // Restore AI channels from disk
        const aiChannelsPath = path.join(__dirname, "../../database/json/ai_channels.json");
        try {
            if (fs.existsSync(aiChannelsPath)) {
                const channelData = JSON.parse(fs.readFileSync(aiChannelsPath, "utf8") || "{}");
                for (const channels of Object.values(channelData)) {
                    for (const chId of channels) client.aiChannels?.add(chId);
                }
            }
        } catch (err) { console.error(chalk.red("    [AI CHANNELS] Load error:"), err.message); }

        // Restore AI disabled guilds from disk
        const aiTogglePath = path.join(__dirname, "../../database/json/ai_toggle.json");
        try {
            if (fs.existsSync(aiTogglePath)) {
                const toggleData = JSON.parse(fs.readFileSync(aiTogglePath, "utf8") || "{}");
                for (const [gid, enabled] of Object.entries(toggleData)) {
                    if (enabled === false) client.aiDisabled?.add(gid);
                }
            }
        } catch (err) { console.error(chalk.red("    [AI TOGGLE] Load error:"), err.message); }

        // Restore per-server AI settings from disk
        const aiSettingsPath = path.join(__dirname, "../../database/json/ai_settings.json");
        try {
            if (fs.existsSync(aiSettingsPath)) {
                const settingsData = JSON.parse(fs.readFileSync(aiSettingsPath, "utf8") || "{}");
                for (const [gid, cfg] of Object.entries(settingsData)) {
                    client.aiSettings?.set(gid, cfg);
                }
            }
        } catch (err) { console.error(chalk.red("    [AI SETTINGS] Load error:"), err.message); }

        // Restore leveling-disabled guilds from disk
        const levelTogglePath = path.join(__dirname, "../../database/json/leveling_toggle.json");
        try {
            if (fs.existsSync(levelTogglePath)) {
                const lt = JSON.parse(fs.readFileSync(levelTogglePath, "utf8") || "{}");
                for (const [gid, val] of Object.entries(lt)) {
                    if (val === false) client.levelingDisabled?.add(gid);
                }
            }
        } catch (err) { console.error(chalk.red("    [LEVELING] Toggle load error:"), err.message); }

        // Start daily backup scheduler
        try {
            const { startBackupScheduler } = require("../../addons/backup/backupManager");
            startBackupScheduler();
        } catch (err) { console.error(chalk.red("    [BACKUP] Scheduler error:"), err.message); }
    },
};
