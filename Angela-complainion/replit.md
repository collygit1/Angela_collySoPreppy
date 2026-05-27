# Angela — Discord Bot

A fully-featured Discord bot built with discord.js v14. Uses a clustered sharding architecture via `discord-hybrid-sharding`. Supports slash commands, prefix commands, music playback (DisTube), AFK system, moderation, Gemini AI chat, and a full anti-raid/anti-nuke security suite.

## Project Structure

```
.
├── shard.js                        # Entry point — spawns cluster shards
├── index.js                        # Bot core — initializes client, loads handlers
│
└── src/
    ├── config/
    │   ├── settings.js             # Bot settings (owner ID, prefix, colors, emojis)
    │   └── constants.js            # Shared constants (regex, banned words, keywords)
    │
    ├── handlers/
    │   ├── commandHandler.js       # Loads all commands + registers slash commands
    │   └── eventHandler.js         # Loads all events from src/events/
    │
    ├── systems/                    # Pure security logic (imported by events)
    │   ├── antiRaid.js             # Join flood detection + auto-response
    │   ├── antiSpam.js             # Message/mention/link spam detection + punishment
    │   ├── antiNuke.js             # Audit-log anti-nuke + permissions guard
    │   └── automod.js              # Anti-swear + AI-powered NSFW image filter
    │
    ├── events/
    │   ├── ready.js                # Startup display + AFK cleanup + presence
    │   ├── messageCreate.js        # AFK wake/mention + security checks + prefix cmds
    │   ├── guildMemberAdd.js       # Account age check + blacklist + anti-raid
    │   ├── guildAuditLog.js        # Anti-nuke + permissions guard trigger
    │   ├── messageDelete.js        # Snipe tracking
    │   ├── messageUpdate.js        # Edit logging to security channel
    │   ├── interactionCreate.js    # Slash cmd router + gate button handler
    │   ├── guildCreate.js          # NSFW server filter + welcome gate
    │   ├── aichat.js               # Gemini AI chat (mention / AI channel)
    │   ├── invites.js              # Bot invite link generator
    │   └── partnership.js          # Partnership invite tracker
    │
    ├── commands/
    │   ├── admin/                  # verify.js — setup-verification slash command
    │   ├── fun/                    # 8ball, ship, hug, pat, slap, etc.
    │   ├── moderator/              # ban, kick, lockdown, unlock, panic, whitelist, etc.
    │   ├── music/                  # play, skip, stop, volume (DisTube)
    │   └── utility/                # afk, help, ping, userinfo, serverinfo, etc.
    │
    ├── utils/
    │   ├── logger.js               # Chalk-based centralized logger
    │   ├── embeds.js               # Reusable EmbedBuilder helpers
    │   ├── permissions.js          # isBypassed / isTrustedExecutor helpers
    │   ├── securityActions.js      # logSecurity, quarantineUser, lockdownGuild, unlockGuild
    │   └── giphy.js                # Giphy API helper (fetchGif)
    │
    └── database/
        ├── securityStore.js        # JSON-backed security config CRUD
        ├── models/
        │   ├── Guild.js            # Mongoose schema: guild activation state
        │   └── GuildID.js          # Mongoose schema: guild ID registry
        └── json/                   # Runtime JSON persistence
            ├── afk.json
            ├── security.json
            ├── warns.json
            ├── prefixes.json
            ├── bot_state.json
            └── ...
```

## Running the Bot

Start with the cluster manager (recommended):
```
node shard.js
```

Or run directly (single shard):
```
node index.js
```

## Required Environment Variables

Set these as Replit Secrets:

| Variable | Description |
|---|---|
| `TOKEN` | Discord bot token |
| `CLIENT_ID` | Discord application client ID |
| `CLIENT_SECRET` | Discord application client secret |
| `MONGO_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GIPHY_KEY` | Giphy API key |

## User Preferences

- All folder names use lowercase
- Commands are split into categories: fun, moderator, music, utility, admin
- Security logic lives in `src/systems/` — events call into systems, not the other way
- Utilities live in `src/utils/`
- Database files (JSON + Mongoose models) live in `src/database/`
- Secrets are managed via Replit Secrets (not hardcoded)
