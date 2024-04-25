const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

async function getVideoInfo(html) {
    const $ = cheerio.load(html);

    const videoInfo = [];

    $('td.t-content1').each((index, element) => {
        const resolution = $(element).text().trim();
        const format = $(element).next().find('i').attr('class').replace('fas fa-', '');
        const size = $(element).next().next().text().trim();
        const downloadUrl = $(element).next().next().next().find('a').attr('href');

        videoInfo.push({
            resolution,
            format,
            size,
            downloadUrl
        });
    });

    return videoInfo;
}

async function getRedirectedHtml(youtubeUrl) {
    const token = '665bd17a47ad721615f5dedd7b173f186abca42b8e1cfd0f3a4873e8372d0bb6';
    const scrapeUrl = `https://www.helloconverter.com/download?url=${youtubeUrl}&token=${token}`;

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    
    const response = await axios.get(scrapeUrl, { headers });

    const html = response.data;

    const videoInfo = await getVideoInfo(html);

    return videoInfo;
}

app.get('/yt', async (req, res) => {
    const youtubeUrl = req.query.url;

    try {
        const videoInfo = await getRedirectedHtml(youtubeUrl);
        res.json(videoInfo);
    } catch (error) {
        console.error('Error fetching redirected HTML:', error);
        res.status(500).json({ error: 'Failed to fetch video information' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
