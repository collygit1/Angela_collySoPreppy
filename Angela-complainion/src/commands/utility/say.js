const axios = require('axios');
const { 
    SlashCommandBuilder, PermissionFlagsBits, 
    AttachmentBuilder, EmbedBuilder 
} = require('discord.js');

// 🛡️ SECURITY CONFIG — set SIGHTENGINE_USER, SIGHTENGINE_SECRET, SIGHTENGINE_WORKFLOW in Replit Secrets
const SIGHTENGINE_USER   = process.env.SIGHTENGINE_USER   || "";
const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET || "";
const WORKFLOW_ID        = process.env.SIGHTENGINE_WORKFLOW || "";

const prohibitedWords = ["fuck", "shit", "bitch"]; 

module.exports = {
    name: 'say',
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Lacri Chan Full Architect Broadcast')
        /* --- 📝 THE MAIN MESSAGE (SELF-BOT STYLE) --- */
        .addStringOption(o => o.setName('message').setDescription('Plain text message (Above the embed)').setRequired(true))

        /* --- 🎯 TARGETING --- */
        .addUserOption(o => o.setName('user').setDescription('Target user (Sends as DM if selected)'))
        .addUserOption(o => o.setName('reply_user').setDescription('Reply to this user\'s most recent message in the channel'))
        .addStringOption(o => o.setName('reply_id').setDescription('ID of message to reply to (Soul Tether)'))
        .addChannelOption(o => o.setName('target').setDescription('Target channel (defaults to current)'))
        .addAttachmentOption(o => o.setName('image').setDescription('Main large image (Full Width)'))

        /* --- 🎨 EMBED MAIN PARTS --- */
        .addStringOption(o => o.setName('description').setDescription('Text INSIDE the embed box'))
        .addStringOption(o => o.setName('title').setDescription('Embed Title (256 chars)'))
        .addStringOption(o => o.setName('url').setDescription('Title URL link'))
        .addStringOption(o => o.setName('color').setDescription('Hex Color (e.g. #2b2d31)'))

        /* --- 👤 AUTHOR SECTION --- */
        .addStringOption(o => o.setName('author_name').setDescription('Author Name'))
        .addStringOption(o => o.setName('author_icon').setDescription('Author Icon URL'))
        .addStringOption(o => o.setName('author_url').setDescription('Author link URL'))

        /* --- 📊 FIELDS SECTION --- */
        .addStringOption(o => o.setName('f1_name').setDescription('Field 1: Name'))
        .addStringOption(o => o.setName('f1_value').setDescription('Field 1: Value'))
        .addBooleanOption(o => o.setName('f1_inline').setDescription('Field 1: Inline?'))
        .addStringOption(o => o.setName('f2_name').setDescription('Field 2: Name'))
        .addStringOption(o => o.setName('f2_value').setDescription('Field 2: Value'))
        .addBooleanOption(o => o.setName('f2_inline').setDescription('Field 2: Inline?'))

        /* --- 🖼️ VISUALS & FOOTER --- */
        .addStringOption(o => o.setName('thumbnail').setDescription('Small image URL (Top Right)'))
        .addStringOption(o => o.setName('footer_text').setDescription('Footer Text'))
        .addStringOption(o => o.setName('footer_icon').setDescription('Footer Icon URL'))
        .addBooleanOption(o => o.setName('timestamp').setDescription('Add current time?'))

        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const mainMsg = interaction.options.getString('message');
        const eDesc = interaction.options.getString('description');
        const dmUser = interaction.options.getUser('user');
        const replyUser = interaction.options.getUser('reply_user');
        const replyId = interaction.options.getString('reply_id');
        const targetChannel = interaction.options.getChannel('target') || interaction.channel;
        const mainImage = interaction.options.getAttachment('image');

        // 🚨 SECURITY SCAN (Visual)
        if (mainImage && mainImage.contentType?.startsWith('image/')) {
            try {
                const res = await axios.get('https://api.sightengine.com/1.0/check-workflow.json', {
                    params: { 'url': mainImage.url, 'workflow': WORKFLOW_ID, 'api_user': SIGHTENGINE_USER, 'api_secret': SIGHTENGINE_SECRET }
                });
                if (res.data.summary.action === 'reject') return interaction.editReply({ content: "♰ **Security Intercepted: Media rejected.**" });
            } catch (e) { console.error("Scan Error:", e.message); }
        }

        // 🚨 TEXT SCAN
        const safetyBuffer = `${mainMsg} ${eDesc || ""}`.toLowerCase();
        if (prohibitedWords.some(w => safetyBuffer.includes(w))) {
            return interaction.editReply({ content: "♰ **Security Intercepted: Bad language detected.**" });
        }

        // ⏳ MANUAL THINKING PHASE
        // Triggers "typing..." automatically for 2.5s to feel manual
        if (!dmUser) {
            await targetChannel.sendTyping();
            await new Promise(r => setTimeout(r, 2500));
        }

        // 🏗️ CONSTRUCT PAYLOAD
        const payload = { content: mainMsg, embeds: [] };

        // BUILD EMBED IF OPTIONS ARE USED
        if (eDesc || interaction.options.getString('title') || mainImage || interaction.options.getString('f1_name')) {
            const embed = new EmbedBuilder()
                .setColor(interaction.options.getString('color') || '#2b2d31');

            if (eDesc) embed.setDescription(eDesc.substring(0, 4096));
            if (interaction.options.getString('title')) embed.setTitle(interaction.options.getString('title').substring(0, 256));
            if (interaction.options.getString('url')) embed.setURL(interaction.options.getString('url'));
            if (interaction.options.getBoolean('timestamp')) embed.setTimestamp();
            if (interaction.options.getString('thumbnail')) embed.setThumbnail(interaction.options.getString('thumbnail'));
            if (mainImage) embed.setImage(mainImage.url);

            // Author Section
            if (interaction.options.getString('author_name')) {
                embed.setAuthor({ 
                    name: interaction.options.getString('author_name').substring(0, 256), 
                    iconURL: interaction.options.getString('author_icon') || null,
                    url: interaction.options.getString('author_url') || null
                });
            }

            // Fields Section
            if (interaction.options.getString('f1_name') && interaction.options.getString('f1_value')) {
                embed.addFields({ 
                    name: interaction.options.getString('f1_name').substring(0, 256), 
                    value: interaction.options.getString('f1_value').substring(0, 1024),
                    inline: interaction.options.getBoolean('f1_inline') || false 
                });
            }
            if (interaction.options.getString('f2_name') && interaction.options.getString('f2_value')) {
                embed.addFields({ 
                    name: interaction.options.getString('f2_name').substring(0, 256), 
                    value: interaction.options.getString('f2_value').substring(0, 1024),
                    inline: interaction.options.getBoolean('f2_inline') || false 
                });
            }

            // Footer Section
            if (interaction.options.getString('footer_text')) {
                embed.setFooter({ 
                    text: interaction.options.getString('footer_text').substring(0, 2048),
                    iconURL: interaction.options.getString('footer_icon') || null
                });
            }

            payload.embeds = [embed];
        }

        // 🚀 THE INTERACTIVE DISPATCH
        try {
            if (dmUser) {
                await dmUser.send(payload);
                await interaction.editReply({ content: "🍰 **DM Broadcast Synchronized.**" });
            } else if (replyUser) {
                // Fetch recent messages and find the latest one from the target user
                const messages = await targetChannel.messages.fetch({ limit: 100 });
                const target = messages.find(m => m.author.id === replyUser.id);
                if (!target) return interaction.editReply({ content: `🍥 **No recent message found from ${replyUser.username} in this channel.**` });
                await target.reply(payload);
                await interaction.editReply({ content: `🍰 **Replied to ${replyUser.username}'s message.**` });
            } else if (replyId) {
                const originalMsg = await targetChannel.messages.fetch(replyId);
                await originalMsg.reply(payload);
                await interaction.editReply({ content: "🍰 **Tethered Reply Deployed.**" });
            } else {
                await targetChannel.send(payload);
                await interaction.editReply({ content: "🍰 **Channel Broadcast Deployed.**" });
            }
        } catch (err) {
            await interaction.editReply({ content: `🍥 **Transmission Failed:** ${err.message}` });
        }
    }
};