const { Events } = require("discord.js");
const { RepeatMode } = require("distube");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        /* ── Music Button Controls ─────────────────────────────── */
        if (interaction.isButton() && interaction.customId.startsWith("music_")) {
            const queue = client.distube.getQueue(interaction.guildId);

            if (!queue) {
                return interaction.reply({ content: "🎵 Nothing is playing right now~", ephemeral: true });
            }

            await interaction.deferUpdate().catch(() => {});

            try {
                switch (interaction.customId) {
                    case "music_pause":
                        if (!queue.paused) queue.pause();
                        break;
                    case "music_resume":
                        if (queue.paused) queue.resume();
                        break;
                    case "music_skip":
                        await queue.skip().catch(() => queue.stop());
                        break;
                    case "music_skip_back":
                        if (queue.previousSongs?.length > 0) await queue.previous().catch(() => {});
                        break;
                    case "music_stop":
                        queue.stop();
                        break;
                    case "music_loop_cycle": {
                        const next = (queue.repeatMode + 1) % 3;
                        queue.setRepeatMode(next);
                        const labels = { [RepeatMode.DISABLED]: "Off", [RepeatMode.SONG]: "🔂 Song", [RepeatMode.QUEUE]: "🔁 Queue" };
                        await interaction.followUp({ content: `🔁 Loop → **${labels[next]}**`, ephemeral: true });
                        break;
                    }
                }
            } catch (err) {
                console.error("[MusicButton]", err);
            }
            return;
        }

        /* ── Slash Commands ────────────────────────────────────── */
        if (!interaction.isChatInputCommand()) return;

        // Maintenance mode — block all non-owner commands
        if (client.maintenance && interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: "🔧 Angela is in maintenance mode right now~ Please check back soon! ♡",
                ephemeral: true,
            });
        }

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.error(`Slash Command Error [${interaction.commandName}]:`, err);
            const reply = { content: "❌ An error occurred while executing this command.", ephemeral: true };
            if (interaction.deferred)      await interaction.editReply(reply).catch(() => {});
            else if (!interaction.replied) await interaction.reply(reply).catch(() => {});
        }
    },
};
