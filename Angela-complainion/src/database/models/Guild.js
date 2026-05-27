const mongoose = require("mongoose");

const GuildSchema = new mongoose.Schema({
    guildId:     { type: String,  required: true, unique: true },
    isActivated: { type: Boolean, default: false },
    activatedBy: { type: String },
    activatedAt: { type: Date,    default: Date.now },
    systemCore: {
        modelBrain:      { type: String, default: "Gemini 2.0 Flash-Lite" },
        firmwareVersion: { type: String, default: "AngelaOS v2.6" },
        linkStability:   { type: String, default: "100%" },
    },
});

module.exports = mongoose.model("Guild", GuildSchema);
