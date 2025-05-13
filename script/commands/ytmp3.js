const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "ytmp3",
    version: "1.0.0",
    permission: 0,
    credits: "vrax",
    premium: false,
    description: "Send YouTube Music",
    prefix: false,
    category: "without prefix",
    usages: `ytmp3 [music title]`,
    cooldowns: 5,
    dependencies: {
        "path": "",
        "fs-extra": ""
    }
};

module.exports.run = async function ({ api, event, args }) {
    const query = args.join(' ');
    if (!query) {
        return api.sendMessage('Please provide a song title, e.g. ytmp3 Selos', event.threadID, event.messageID);
    }

    const searchApi = `https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`;

    try {
        const searchRes = await axios.get(searchApi);
        const data = searchRes.data;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return api.sendMessage('No results found. Try a different song name.', event.threadID, event.messageID);
        }

        const videoUrl = data[0].url;
        const channelName = data[0].channelName;

        const downloadApi = `https://kaiz-apis.gleeze.com/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const downloadRes = await axios.get(downloadApi);
        const audioData = downloadRes.data;

        if (!audioData || !audioData.audio) {
            return api.sendMessage('Unable to download audio. Please try another song.', event.threadID, event.messageID);
        }

        const audioUrl = audioData.audio;
        const sanitizedTitle = audioData.title.replace(/[\\/:*?"<>|]/g, '');
        const filePath = path.join(__dirname, `${sanitizedTitle}.mp3`);

        const audioStream = await axios({
            method: 'GET',
            url: audioUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        audioStream.data.pipe(writer);

        writer.on('finish', async () => {
            await api.sendMessage(`Title: ${audioData.title}\nUploader: ${channelName}`, event.threadID);
            api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID, () => {
                fs.unlinkSync(filePath);
            }, event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage('Error saving the audio file.', event.threadID, event.messageID);
        });

    } catch (err) {
        console.error('Error:', err.message || err);
        api.sendMessage('An error occurred while processing your request.', event.threadID, event.messageID);
    }
};
