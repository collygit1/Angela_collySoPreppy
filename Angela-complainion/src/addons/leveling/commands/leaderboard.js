const { SlashCommandBuilder } = require("discord.js");
const { getTop } = require("../levelStore");
const Embeds = require("../../../utils/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("levels")
        .setDescription("✦ See the top leveled members in this server")
        .addIntegerOption(o => o
            .setName("page")
            .setDescription("Page number")
            .setMinValue(1)),

    async execute(interaction) {
        const page = interaction.options.getInteger("page") ?? 1;
        const { entries, totalPages } = getTop(interaction.guildId, 10, page);

        await interaction.reply({ embeds: [
            Embeds.leaderboard(entries, interaction.guild?.name, page, totalPages, interaction.client),
        ]});
    },

    async prefixExecute(message, args) {
        const page = parseInt(args[0]) || 1;
        const { entries, totalPages } = getTop(message.guildId, 10, page);

        await message.reply({ embeds: [
            Embeds.leaderboard(entries, message.guild?.name, page, totalPages, message.client),
        ]});
    },
};
