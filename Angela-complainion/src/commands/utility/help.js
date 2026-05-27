const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

module.exports = {
    name: "help",
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("View Angela OS panel sectors"),

    async execute(interaction) {
        await this.handleHelp(interaction, interaction.user);
    },

    async prefixExecute(message) {
        await this.handleHelp(message, message.author);
    },

    async handleHelp(context, user) {
        const { client, guildId } = context;

        // 🧠 High-Speed Memory Access
        const lang = (client.languages?.get?.(guildId)) || 'en';
        const prefix = (client.prefixes?.get?.(guildId)) || 'a!'; 

        // 🎀 Manual Emoji Core (Cleared for you)
        const e = {
            credits: '',
            folder: '',
            donate: '',
            rules: '',
            stars: '',
            feather: '',
            ribbon: '',
            flower: '🌸'
        };

        const t = getTranslations(lang);
        const categories = getCategories();

        const embed = new EmbedBuilder()
            .setColor("#ffcad4") // Matching Angela's pink theme
            .setAuthor({ 
                name: `ANGELA OS • ${t.title.toUpperCase()}`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setTitle(`${e.stars} SYSTEM PROTOCOL INDEX`)
            .setDescription(
                `*“Organizing the boutique for maximum efficiency.”*\n` +
                `🌷 ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ 🌷\n` +
                `### ${e.ribbon} **${t.greet.toUpperCase()}**\n` +
                `${t.desc}\n\n` +
                `- **${e.feather} TRIGGER:** \`${prefix}\`\n` +
                `- **${e.rules} LANGUAGE:** \`${lang.toUpperCase()}\`\n` +
                `🌷 ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ 🌷`
            )
            .setFooter({ text: `• ${t.footer.toUpperCase()}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        // 📂 Add Categories Dynamically
        const categoryEntries = Object.entries(categories);

        if (categoryEntries.length === 0) {
            embed.addFields({ name: "⚠️ System Warning", value: "No command sectors detected." });
        } else {
            for (const [cat, cmds] of categoryEntries) {
                embed.addFields({ 
                    name: `${e.folder} ${cat.toUpperCase()} SECTOR`, 
                    value: `\`${cmds.join("` • `")}\``,
                    inline: false
                });
            }
        }

        // --- 🖱️ BUTTON LINKS ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Support')
                .setEmoji(e.feather || '✨')
                .setURL('https://discord.gg/wDAACXE6ZB')
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('Credits')
                .setEmoji(e.credits || '💎')
                .setURL('https://discord.com') 
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('Donate')
                .setEmoji(e.donate || '🎁')
                .setURL('https://buymeacoffee.com/angelicserq')
                .setStyle(ButtonStyle.Link)
        );

        const messagePayload = { embeds: [embed], components: [row] };

        if (context.isChatInputCommand?.()) {
            await context.reply({ ...messagePayload, ephemeral: true });
        } else {
            // Updated to use the flower emoji as a fallback prefix for the text message
            await context.reply({ content: `${e.flower} ${e.stars} **${t.title}**`, ...messagePayload });
        }
    }
};

function getTranslations(lang) {
    const local = {
        en: { title: "Help Panel", greet: "Greetings", desc: "Protocols are categorized by sector for speed.", footer: "Explore via / or prefix." },
        tl: { title: "Panel ng Tulong", greet: "Mabuhay", desc: "Naka-organisa ang mga protocol sa bawat sektor.", footer: "Gamitin ang / o prefix." },
        ko: { title: "도움말 패널", greet: "안녕하십니까", desc: "프로토콜이 섹터로 구성되어 있습니다.", footer: "/ 또는 접두사를 사용하십시오." },
        ja: { title: "ヘルプパネル", greet: "ご挨拶", desc: "セクターごとに整理されています。", footer: "/ またはプレフィックスを使用。" }
    };
    return local[lang] || local.en;
}

function getCategories() {
    const commandsPath = path.join(process.cwd(), "src", "commands"); 
    const categories = {};
    if (!fs.existsSync(commandsPath)) return categories;

    const folders = fs.readdirSync(commandsPath);
    for (const folder of folders) {
        const folderPath = path.join(commandsPath, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));
            if (files.length > 0) {
                categories[folder] = files.map(f => f.replace(".js", ""));
            }
        }
    }
    return categories;
}