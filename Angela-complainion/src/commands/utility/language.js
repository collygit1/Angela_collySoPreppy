const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { bot, theme, emojis } = require(path.join(process.cwd(), 'src/config/settings'));

const LANG_PATH = path.join(process.cwd(), 'src', 'database', 'json', 'serverlanguage.json');

// ✨ Your Custom Boutique Assets
const b = {
    stars: '<:Starrypinkwizardhat:1498992235184918618>',
    feather: '<a:Star_:1499359930094977178>',
    doll: '<:ribbonangela:1405809043057938525>',
    ribbon: '<a:Pinky_ribbon:1328930688845479940>',
    flower: '<:purpleween:1498992063155404892>'
};

module.exports = {
    name: 'language',
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('🎀 Calibrate Angela\'s linguistic settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub => 
            sub.setName('set')
                .setDescription('Select the target language protocol')
                .addStringOption(o => 
                    o.setName('set') 
                    .setDescription('Target Protocol')
                    .setRequired(true)
                    .addChoices(
                        { name: '🇺🇸 English', value: 'en' },
                        { name: '🇰🇷 Korean (한국어)', value: 'ko' },
                        { name: '🇯🇵 Japanese (日本語)', value: 'ja' },
                        { name: '🇵🇭 Tagalog (Filipino)', value: 'tl' }
                    )))
        .addSubcommand(sub => sub.setName('status').setDescription('View current calibration'))
        .addSubcommand(sub => sub.setName('reset').setDescription('Restore default settings')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(false);
        const choice = interaction.options.getString('set') || 'en';

        const result = this.processLogic(interaction.guildId, choice, interaction.client, interaction.guild, subcommand);
        return interaction.reply({ embeds: [result] });
    },

    async prefixExecute(message, args, client) {
        const action = args[0]?.toLowerCase(); 
        const choice = args[1]?.toLowerCase() || 'en';
        const valid = ['en', 'ko', 'ja', 'tl'];
        const mode = ['set', 'status', 'reset'].includes(action) ? action : 'status';

        if (mode === 'set' && !valid.includes(choice)) {
            return message.reply(`${b.stars} **Error:** Valid protocols: \`en\`, \`ko\`, \`ja\`, \`tl\`.`);
        }

        const result = this.processLogic(message.guildId, choice, client, message.guild, mode);
        return message.reply({ embeds: [result] });
    },

    processLogic(guildId, choice, client, guild, mode) {
        let data = {};
        if (fs.existsSync(LANG_PATH)) {
            try {
                const content = fs.readFileSync(LANG_PATH, 'utf8');
                data = content ? JSON.parse(content) : {};
            } catch { data = {}; }
        }

        let currentLang = data[guildId] || 'en';
        let actionTitle = 'SYSTEM STATUS';

        if (mode === 'set') {
            data[guildId] = choice;
            currentLang = choice;
            actionTitle = 'PROTOCOL UPDATED';
        } else if (mode === 'reset') {
            delete data[guildId];
            currentLang = 'en';
            actionTitle = 'PROTOCOL RESET';
        }

        if (mode === 'set' || mode === 'reset') {
            fs.writeFileSync(LANG_PATH, JSON.stringify(data, null, 2));
            if (client.languages) client.languages.set(guildId, currentLang);
        }

        const labels = { en: 'English (US)', ko: 'Korean (KR)', ja: 'Japanese (JP)', tl: 'Tagalog (PH)' };
        const confirms = {
            en: "Linguistic modules are now operational in **“English”**.",
            ko: "언어 모듈이 **“한국어”**로 설정되었습니다.",
            ja: "言語モジュールが**“日本語”**に設定されました。",
            tl: "Naka-calibrate na ang aking module sa **“Tagalog”**."
        };

        return new EmbedBuilder()
            .setColor(theme?.pink || '#ffb6c1')
            .setAuthor({ 
                name: `ANGELA OS • ${actionTitle}`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setDescription(
                `### ${b.stars} ACTIVE PROTOCOL: \`${labels[currentLang].toUpperCase()}\`\n` +
                `> *“${confirms[currentLang]}”*\n\n` +
                `${b.flower} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${b.flower}\n` +
                `- ${b.feather} **STATUS:** \`Operational\`\n` +
                `- ${b.doll} **SYNC:** \`RAM & Storage\`\n` +
                `- ${b.ribbon} **CORE:** \`Boutique-Linguistics-v1.3\`\n` +
                `${b.flower} ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ${b.flower}\n\n` +
                `🎀 **SERVER:** \`${guild.name.toUpperCase()}\`\n` +
                `🎀 **SYSTEM ID:** \`${guildId}\``
            )
            .setFooter({ text: `ANGELA PROTOCOL: ${currentLang.toUpperCase()} • MODE: ${mode.toUpperCase()}` })
            .setTimestamp();
    }
};