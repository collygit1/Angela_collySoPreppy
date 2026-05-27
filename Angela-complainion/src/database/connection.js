const mongoose = require("mongoose");
const logger   = require("../utils/logger");

async function connectDatabase() {
    if (!process.env.MONGO_URI) {
        logger.warn("MONGO_URI not set — database features disabled.");
        return false;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.success("Database connected.");
        return true;
    } catch (err) {
        logger.error("Database connection failed:", err);
        return false;
    }
}

function disconnectDatabase() {
    return mongoose.disconnect().catch(() => {});
}

module.exports = { connectDatabase, disconnectDatabase };
