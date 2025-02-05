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
module.exports.handleEvent = async function({api, event, botname }) {
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

				try {
					const attachment = event.messageReply.attachments[0].url;
					const res = await axios.get(`https://character.ryukodev.gleeze.com/api?name=gemini&message=${encodeURIComponent(processedAsk)}&url=${encodeURIComponent(attachment)}`);
					const reply = res.data.response;
					return api.sendMessage(reply, event.threadID, event.messageID);
				} catch (err) {
					const res = await axios.get(`https://character.ryukodev.gleeze.com/api?name=gemini&message=${encodeURIComponent(processedAsk)}`);
					const reply = res.data.response;
					return api.sendMessage(reply, event.threadID, event.messageID);
				}
			} catch (error) {
				return api.sendMessage("failed to get a response from the api.", event.threadID, event.messageID);
			}
		}
	} catch (error) {}
};
module.exports.run = async function({ api, event, args, botname }) {
	const ask = args.join(' ');
	if (!ask) {
		return api.sendMessage(`please provide a message`, event.threadID, event.messageID);
	}
	try {
		try {
			const attachment = event.messageReply.attachments[0].url;
			const res = await axios.get(`https://character.ryukodev.gleeze.com/api?name=gemini&message=${encodeURIComponent(ask)}&url=${encodeURIComponent(attachment)}`);
			const reply = res.data.response;
			return api.sendMessage(reply, event.threadID, event.messageID);
		} catch (err) {
			const res = await axios.get(`https://character.ryukodev.gleeze.com/api?name=gemini&message=${encodeURIComponent(ask)}`);
			const reply = res.data.response;
			return api.sendMessage(reply, event.threadID, event.messageID);
		}
	} catch (error) {
		return api.sendMessage("failed to get a response from the api.", event.threadID, event.messageID);
	}
}