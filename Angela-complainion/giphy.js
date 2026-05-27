piconst axios = require('axios'); // IF THIS ERRORS, RUN: npm install axios

async function fetchGif(tag) {
    try {
        const response = await axios.get(`https://api.giphy.com/v1/gifs/random`, {
            params: {
                api_key: process.env.GIPHY_KEY,
                tag: tag,
                rating: 'g'
            }
        });
        return response.data.data.images.original.url;
    } catch (error) {
        console.error("Giphy Error:", error.message);
        return "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Zid3R5bmZ4bmR4eGZ4ZngmZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PWc/Ulyubf7eYczLO/giphy.gif";
    }
}

// THIS LINE IS CRITICAL - DO NOT FORGET IT
module.exports = { fetchGif };