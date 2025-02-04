module.exports.config = {
    name: "ai",
    credits: "ryuko",
    version: '1.0.0',
    description: "talk with gemini 2.0 flash exp",
    prefix: false,
    premium: false,
    permission: 0,
    category: "without prefix",
    cooldowns: 0,
    dependencies: {
        "axios": ""
    }
}
const axios = require("axios");
module.exports.handleEvent = async function ({ api, event, botname }) {
    try {
        const ask = event.body?.toLowerCase() || '';
        if (ask.includes(botname.toLowerCase())) {
            try {
                const escapedBotname = botname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const processedAsk = ask
                    .replace(new RegExp(escapedBotname, 'gi'), '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .replace(/\s+([,.?!])/g, '$1');

                const res = await axios.get(`https://character-api.up.railway.app/api?name=gemini&message=${encodeURIComponent(processedAsk)}`);
                
                if (res.data?.status === "success") {
                    const answer = res.data.message;
                    return api.sendMessage(answer, event.threadID, event.messageID);
                } else {
                    return api.sendMessage(res.data?.message || "unexpected error in api", event.threadID, event.messageID);
                }
            } catch (error) {
                return api.sendMessage("failed to get a response from the api.", event.threadID, event.messageID);
            }
        }
    } catch (error) {}
};
module.exports.run = async function ({api, event, args, botname }) {
    const ask = args.join(' ');
    if (!ask) {
        return api.sendMessage(`please provide a message`, event.threadID, event.messageID);
    }
    try {
        const res = await axios.get(`https://character-api.up.railway.app/api?name=gemini&message=${encodeURIComponent(ask)}`);
        const data = res.data;
        if (data.status == "success") {
            return api.sendMessage(data.message, event.threadID, event.messageID);
        } else {
            return api.sendMessage(data.message, event.threadID, event.messageID);
        }
    } catch (error) {
        return api.sendMessage(`something went wrong, please try again later`, event.threadID, event.messageID)
    }
}