const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const OWNER_ID = process.env.OWNER_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("maintenance")
        .setDescription("✦ [Owner] Toggle maintenance mode — pauses all commands for non-owners")
        .addStringOption(o => o
            .setName("action")
            .setDescription("on or off")
            .setRequired(true)
            .addChoices(
                { name: "on  — enable maintenance", value: "on"  },
                { name: "off — disable maintenance", value: "off" },
            )),

    async execute(interaction) {
        if (OWNER_ID && interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ This command is restricted to the bot owner.", ephemeral: true });
        }

        const on = interaction.options.getString("action") === "on";
        interaction.client.maintenance = on;

        const embed = new EmbedBuilder()
            .setColor(on ? "#FF4757" : "#2ED573")
            .setAuthor({ name: "angela ♡ | Owner Dashboard", iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle(on ? "🔴 Maintenance Mode ON" : "🟢 Maintenance Mode OFF")
            .setDescription(on
                ? "Angela is now in maintenance mode. All commands are paused for non-owners.\nRun `/maintenance off` when done."
                : "Maintenance mode disabled. Angela is back online for everyone! ♡")
            .setFooter({ text: `Changed by ${interaction.user.tag} · ˚ʚ♡ɞ˚ angela` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async prefixExecute(message, args) {
        if (OWNER_ID && message.author.id !== OWNER_ID) return;
        const action = args[0]?.toLowerCase();
        if (!["on", "off"].includes(action)) return message.reply("Usage: `maintenance on/off`");
        message.client.maintenance = action === "on";
        await message.reply(action === "on" ? "🔴 Maintenance mode **ON**." : "🟢 Maintenance mode **OFF**.");
    },
};
