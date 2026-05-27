const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ask")
        .setDescription("Ask Angela anything~")
        .addStringOption(o =>
            o.setName("question")
             .setDescription("What do you want to ask?")
             .setRequired(true)
             .setMaxLength(500)
        ),

    name: "ask",

    async execute(interaction, client) {
        if (!client.aiModel) {
            return interaction.reply({ content: "✨ Neural core offline.", ephemeral: true });
        }

        const question = interaction.options.getString("question");
        await interaction.deferReply();

        try {
            const result = await client.aiModel.generateContent({
                contents: [{ role: "user", parts: [{ text: question }] }]
            });

            await interaction.editReply({ content: result.response.text().trim() });
        } catch (err) {
            await interaction.editReply({
                content: (err?.status === 429 || err?.status === 503)
                    ? "Angela is a little overloaded right now~ Try again in a moment! ♡"
                    : "Something went wrong, try again! ♡"
            });
        }
    },

    async prefixExecute(message, args, client) {
        if (!client.aiModel) return;

        const question = args.join(" ");
        if (!question) return message.reply("Please include a question! ♡");

        await message.channel.sendTyping();

        try {
            const result = await client.aiModel.generateContent({
                contents: [{ role: "user", parts: [{ text: question }] }]
            });

            await message.reply({ content: result.response.text().trim() });
        } catch (err) {
            await message.reply(
                (err?.status === 429 || err?.status === 503)
                    ? "Angela is a little overloaded right now~ Try again in a moment! ♡"
                    : "Something went wrong, try again! ♡"
            );
        }
    }
};
