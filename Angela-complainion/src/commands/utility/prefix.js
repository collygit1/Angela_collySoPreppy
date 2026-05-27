const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

// --- 🎨 EMOJI ASSETS ---
// These specific IDs must exist in a server the bot is in, or they will show as text.
const emojis = {
    cupcake: "<:cupcake:1455889268869435574>",
    cake: "<:cake:1455889214267719721>",
    donut: "<:donut:1455889051071811606>",
    rolling: "<:rolling:1455889183934513223>",
    icecream: "<:icecream:1455889116070809634>",
    starfish: "<:pinkish_starfish:1455901785532268574>"
};

const prefixFilePath = path.join(process.cwd(), "src", "database", "json", "prefixes.json");
const defaultPrefix = "Angela^"; // ✅ Updated to Angela Default

module.exports = {
    name: "prefix",
    data: new SlashCommandBuilder()
        .setName("prefix")
        .setDescription("Manage the Angela access protocol")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((sub) =>
            sub
                .setName("set")
                .setDescription("Set a new system prefix")
                .addStringOption((option) =>
                    option
                        .setName("value")
                        .setDescription("New prefix (max 5 characters)")
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) => sub.setName("get").setDescription("View current protocol prefix"))
        .addSubcommand((sub) => sub.setName("reset").setDescription("Reset to default protocol")),

    // 🤖 SLASH COMMAND EXECUTION
    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const newPrefix = interaction.options.getString("value");

        // Defer reply to allow file operations to complete without timeout
        await interaction.deferReply();

        const result = handlePrefixLogic(interaction.guildId, sub, newPrefix, interaction.user, interaction.member, client);

        if (result.error) {
            return interaction.editReply({ content: result.content });
        }
        return interaction.editReply({ embeds: [result.embed] });
    },

    // ⌨️ MESSAGE COMMAND EXECUTION (Angela^ prefix set !)
    async prefixExecute(message, args, client) {
        // If no subcommand is provided, default to 'get'
        const sub = args[0]?.toLowerCase() || "get"; 
        const newPrefix = args[1];

        const result = handlePrefixLogic(message.guildId, sub, newPrefix, message.author, message.member, client);

        if (result.error) {
            return message.channel.send({ content: `⚠️ <@${message.author.id}>, ${result.content}` });
        }

        return message.channel.send({ 
            content: `${emojis.starfish}`,
            embeds: [result.embed] 
        });
    }
};

// --- 🧠 CORE LOGIC PROCESSOR ---
function handlePrefixLogic(guildId, sub, newPrefix, user, member, client) {
    let prefixData = {};

    // 1. Safe Read: Try to read file, fallback to empty object if it fails
    try {
        if (fs.existsSync(prefixFilePath)) {
            const rawData = fs.readFileSync(prefixFilePath, "utf8");
            prefixData = rawData ? JSON.parse(rawData) : {};
        }
    } catch (err) {
        console.error("Prefix Read Error:", err);
        prefixData = {};
    }

    // 2. Clearance Check (Manage Guild Permission)
    const hasPerms = member.permissions.has(PermissionFlagsBits.ManageGuild);
    if ((sub === "set" || sub === "reset") && !hasPerms) {
        return { error: true, content: `${emojis.donut} **Access Denied:** \`Manage Server\` permission required.` };
    }

    const embed = new EmbedBuilder()
        .setColor("#ffcad4")
        .setAuthor({ name: "ANGELA OS | PROTOCOL CONFIG", iconURL: client.user.displayAvatarURL() })
        .setFooter({ text: `Terminal: ${user.tag}`, iconURL: user.displayAvatarURL() })
        .setTimestamp();

    // 3. Logic Branching
    if (sub === "set") {
        if (!newPrefix) return { error: true, content: "Please provide a prefix value." };
        if (newPrefix.length > 5) {
            return { error: true, content: `${emojis.icecream} **Protocol Error:** Prefix cannot exceed 5 characters.` };
        }

        prefixData[guildId] = newPrefix;
        saveData(prefixData, client, guildId, newPrefix);

        embed.setDescription(`### ${emojis.cupcake} Configuration Updated\n> System protocol prefix initialized: \` ${newPrefix} \``);
    } 

    else if (sub === "reset") {
        delete prefixData[guildId];
        saveData(prefixData, client, guildId, defaultPrefix);

        embed.setDescription(`### ${emojis.rolling} Protocol Reset\n> System reverted to default: \` ${defaultPrefix} \``);
    } 

    else { // "get"
        // Priority: Check RAM Cache first (Faster)
        const current = client.prefixes?.get(guildId) || defaultPrefix;
        embed.setDescription(`### ${emojis.cake} System Status\n> Active server prefix: \` ${current} \``);
    }

    return { error: false, embed };
}

function saveData(data, client, guildId, value) {
    try {
        // 1. Save to Disk (Persistence)
        fs.writeFileSync(prefixFilePath, JSON.stringify(data, null, 2));

        // 2. Sync to RAM Cache (Instant Detection)
        // This ensures the bot responds to the new prefix immediately without restart
        if (client.prefixes) {
            client.prefixes.set(guildId, value);
        }
    } catch (err) {
        console.error("Prefix Write Error:", err);
    }
}