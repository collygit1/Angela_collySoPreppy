const { SlashCommandBuilder, EmbedBuilder, Events } = require('discord.js');
const translate = require('google-translate-api-x');

// --- 🎨 EMOJI ASSETS ---
const assets = {
    starfish: '<:pinkish_starfish:1455901785532268574>',
    bow: '<:star_c:1459857130831089886>',
    moon: '<:moon_atoms:1455934795766038560>',
    atom: '<:atoms_r:1455934918700961833>'
};

module.exports = {
    name: 'translate',
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('🎀 Transpose text into a different linguistic protocol')
        .addStringOption(o => o.setName('text').setDescription('The content to translate').setRequired(true))
        .addStringOption(o => o.setName('to').setDescription('Target language').setRequired(true).addChoices(
            { name: '🇺🇸 English', value: 'en' },
            { name: '🇰🇷 Korean', value: 'ko' },
            { name: '🇯🇵 Japanese', value: 'ja' },
            { name: '🇵🇭 Tagalog', value: 'tl' }
        )),

    async execute(interaction) {
        const text = interaction.options.getString('text');
        const targetLang = interaction.options.getString('to');
        await this.handleTranslation(interaction, interaction.user, text, targetLang);
    },

    async prefixExecute(message, args) {
        // Syntax: angela^translate [targetLang] [optionalText]
        const targetLang = args[0]?.toLowerCase();
        const validLangs = ['en', 'ko', 'ja', 'tl'];

        if (!targetLang || !validLangs.includes(targetLang)) {
            return message.reply(`⚠️ **Usage:** \`angela^translate <en|ko|ja|tl> [text]\` o i-reply ito sa isang message.`);
        }

        let textToTranslate = args.slice(1).join(' ');

        // --- 📥 REPLY DETECTION LOGIC ---
        // Kung walang text na nilagay pero may nire-reply-an na message
        if (!textToTranslate && message.reference) {
            const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
            textToTranslate = repliedMessage.content;
        }

        if (!textToTranslate) {
            return message.reply(`⚠️ **Protocol Error:** Maglagay ng text o i-reply ang command sa isang message na may text.`);
        }

        await this.handleTranslation(message, message.author, textToTranslate, targetLang);
    },

    // --- ⚙️ Logic Core ---
    async handleTranslation(context, user, text, targetLang) {
        const serverLang = context.client.languages?.get(context.guildId) || 'en';

        const local = {
            en: { title: "NEURAL TRANSLATION", input: "Source", output: "Translated Protocol", proc: "Analyzing syntax..." },
            tl: { title: "NEURAL NA PAGSASALIN", input: "Pinagmulan", output: "Resulta ng Protocol", proc: "Sinusuri ang syntax..." },
            ko: { title: "신경망 번역", input: "원본", output: "번역된 프로토콜", proc: "구문 분석 중..." },
            ja: { title: "ニューラル翻訳", input: "原文", output: "翻訳済みプロトコル", proc: "構文を解析中..." }
        };

        const t = local[serverLang] || local.en;

        // Phase 1: Initiation
        const msg = context.deferred || context.replied ? 
            await context.followUp({ content: `${assets.bow} **${t.proc}**` }) : 
            await context.reply({ content: `${assets.bow} **${t.proc}**`, fetchReply: true });

        try {
            // Phase 2: Translation Core
            const res = await translate(text, { to: targetLang });
            const fromLang = res.from.language.iso.toUpperCase();

            const embed = new EmbedBuilder()
                .setColor('#ffcad4')
                .setAuthor({ 
                    name: `ANGELA TETRA | ${t.title}`, 
                    iconURL: context.client.user.displayAvatarURL() 
                })
                .setDescription(
                    `### ${assets.atom} Sequence Complete\n` +
                    `> **${fromLang}** ${assets.starfish} **${targetLang.toUpperCase()}**`
                )
                .addFields(
                    { name: `${assets.moon} ${t.input}`, value: `\`\`\`text\n${text}\n\`\`\`` },
                    { name: `${assets.starfish} ${t.output}`, value: `\`\`\`text\n${res.text}\n\`\`\`` }
                )
                .setFooter({ text: `System: Angela Tetra • Protocol: ${serverLang.toUpperCase()}`, iconURL: user.displayAvatarURL() })
                .setTimestamp();

            if (context.editReply) {
                await context.editReply({ content: '', embeds: [embed] });
            } else {
                await msg.edit({ content: '', embeds: [embed] });
            }

        } catch (err) {
            console.error(err);
            const errorMsg = serverLang === 'tl' ? "⚠️ Bigo ang pagsasalin." : "⚠️ Linguistic synchronization failed.";
            if (context.editReply) await context.editReply({ content: errorMsg });
            else await msg.edit({ content: errorMsg });
        }
    }
};