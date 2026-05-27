const { SlashCommandBuilder } = require("discord.js");
const { getUser, getRank } = require("../levelStore");
const Embeds = require("../../../utils/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("✦ See your rank card or someone else's")
        .addUserOption(o => o.setName("user").setDescription("The user to look up")),

    async execute(interaction) {
        const target = interaction.options.getUser("user") ?? interaction.user;
        const data   = getUser(interaction.guildId, target.id);
        const rank   = getRank(interaction.guildId, target.id);

        await interaction.reply({ embeds: [
            Embeds.rank({
                username:  target.username,
                avatarURL: target.displayAvatarURL({ size: 256 }),
                level:     data.level,
                currentXp: data.currentXp,
                neededXp:  data.neededXp,
                totalXp:   data.totalXp,
                rank,
                guildName: interaction.guild?.name,
            }),
        ]});
    },

    async prefixExecute(message, args) {
        const target = message.mentions.users.first() ?? message.author;
        const data   = getUser(message.guildId, target.id);
        const rank   = getRank(message.guildId, target.id);

        await message.reply({ embeds: [
            Embeds.rank({
                username:  target.username,
                avatarURL: target.displayAvatarURL({ size: 256 }),
                level:     data.level,
                currentXp: data.currentXp,
                neededXp:  data.neededXp,
                totalXp:   data.totalXp,
                rank,
                guildName: message.guild?.name,
            }),
        ]});
    },
};
