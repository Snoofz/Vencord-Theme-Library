const SocksProxyAgent = require('socks-proxy-agent');
const axios = require('axios');
const fs = require('fs');
const ConsoleUtil = require("../Utility/Console");

const logger = new ConsoleUtil("WallpaperScraper", "red");
var isRateLimited = false;
var rateLimitCount = 0;

const proxies = [
    "socks5://lbgyddbq:r5mftejnc4yj@38.154.227.167:5868",
    "socks5://lbgyddbq:r5mftejnc4yj@185.199.229.156:7492",
    "socks5://lbgyddbq:r5mftejnc4yj@185.199.228.220:7300",
    "socks5://lbgyddbq:r5mftejnc4yj@185.199.231.45:8382",
    "socks5://lbgyddbq:r5mftejnc4yj@188.74.210.207:6286",
    "socks5://lbgyddbq:r5mftejnc4yj@188.74.183.10:8279",
    "socks5://lbgyddbq:r5mftejnc4yj@188.74.210.21:6100",
    "socks5://lbgyddbq:r5mftejnc4yj@45.155.68.129:8133",
    "socks5://lbgyddbq:r5mftejnc4yj@154.95.36.199:6893",
    "socks5://lbgyddbq:r5mftejnc4yj@45.94.47.66:8110"
];

function getRandomProxy() {
    return proxies[Math.floor(Math.random() * proxies.length)];
}

async function fetchImageLinks(keyword, apiKey, cx, num) {
    try {
        const proxy = getRandomProxy();
        const agent = new SocksProxyAgent.SocksProxyAgent(proxy);
        let startPageRandom = Math.floor(Math.random() * 11);
        const response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${keyword}&searchType=image&start=${startPageRandom}&num=${num}`, {
            httpsAgent: agent
        });

        if (response.data.items) {
            const imageLinks = {};
            response.data.items.forEach(item => {
                imageLinks[item.title] = item.link;
            });
            return imageLinks;
        } else {
            // console.error('No items found in the response');
            return {};
        }
    } catch (error) {
        if (error.response && error.response.status === 429) {
                if (rateLimitCount == 70) {
                    logger.warning('Rate limit exceeded. Bypassing ratelimit using new proxy...');
                    rateLimitCount = 0;
                }
                rateLimitCount++;
                isRateLimited = true;
                setTimeout(() => { 
                    isRateLimited = false; 
                }, 20000);
                return fetchImageLinks(keyword, apiKey, cx, num);
        } else {
            logger.fatal('Error fetching images -> ' + error.response ? error.response.data.error : error.message);
            return {};
        }
    }
}

let tempData = [];

async function saveImageLinksToFile(imageLinks) {
    try {
        let existingData = {};
        const newLinks = {};
        for (const [title, link] of Object.entries(imageLinks)) {
            if (!existingData[title]) {
                newLinks[title] = link;
            }
        }

        if (Object.keys(newLinks).length === 0) {
            // console.log('No new links to add.');
            return;
        }

        tempData.push(newLinks);

        if (tempData.length >= 50) {
            let existingData = {};
            if (fs.existsSync('ScrapedImages.json')) {
                existingData = JSON.parse(fs.readFileSync('ScrapedImages.json'));
            }

            const newData = { ...existingData, ...Object.assign({}, ...tempData) };

            fs.writeFileSync('ScrapedImages.json', JSON.stringify(newData, null, 4));
            
            tempData = [];
        }
    } catch (error) {
        logger.fatal('Error saving image links to file:', error);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomKeyword() {
    // a bunch of retarded keywords idk
    const keywords = [
        'ヒポポトモノストロセスキッペダリオフォビア 壁紙',
        '宇宙 壁紙 HD',
        'ニャンキャット GIF 壁紙',
        'ビデオゲーム 壁紙',
        'クールな空 壁紙',
        'クールな 壁紙 HD',
        '宇宙 壁紙 HD',
        'HD ファーリー 背景',
        'ソーラーフレア 壁紙',
        '猫 壁紙 HD',
        '犬 壁紙 HD',
        'ネットワーク GIF 壁紙',
        'クールなデスクトップ 壁紙',
        'かわいいアニメデスクトップ 壁紙',
        'アニメ 壁紙 GIF',
        'アニメ 壁紙',
        'ファーリー 壁紙',
        'ファーリー GIF 壁紙',
        'ファーリー 壁紙 GIF',
        'エッジの効いたデスクトップ 壁紙',
        'エッジの効いた GIF デスクトップ 壁紙',
        'クールな山 壁紙',
        '壁紙',
        'ウィード 壁紙',
        'アニメーション アニメ 壁紙',
        'かわいい 壁紙',
        'かわいい アニメーション 壁紙',
        'シンセウェーブ 壁紙 アニメーション',
        'シンセウェーブ 壁紙 GIF',
        'シンセウェーブ アニメーション 壁紙',
        'エッジの効いた 壁紙',
        'エッジの効いた GIF 壁紙',
        'HD エッジの効いた 壁紙',
        '8K デスクトップ 壁紙',
        '8K GIF 壁紙',
        '4K デスクトップ 壁紙',
        'かわいい デスクトップ 壁紙',
        'HD ファーリー 壁紙',
        '420 スモーク 壁紙',
        'グッチ 壁紙',
        '山 壁紙',
        '雨 壁紙 アニメーション GIF',
        '雨 壁紙 HD',
        '雪 壁紙',
        '雪 壁紙 HD',
        '雪 壁紙 アニメーション',
        'スティーブン・ユニバース 壁紙',
        'スティーブン・ユニバース 壁紙',
        'スティーブン・ユニバース デスクトップ 壁紙',
        'スティーブン・ユニバース デスクトップ 壁紙',
        'NSFW ファーリー 壁紙',
        'NSFW ゲイ ファーリー 壁紙',
        'NSFW ファーリー アニメーション GIF 壁紙',
        'ネコパラ 壁紙',
    ];

    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

    // make the keywords different every search so i dont get the same retarded ass results
    const randomWords = ['cool', 'cute', 'awesome', 'dope', 'nice', 'beautiful', 'amazing', 'hd', 'high quality', '4k', 'desktop', 'best', 'scary', 'bgs', 'backgrounds', 'background'];
    // const randomWords = ["furry"];

    const numRandomWords = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numRandomWords; i++) {
        const randomIndex = Math.floor(Math.random() * (randomKeyword.split(' ').length + 1));
        const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
        keywords.splice(randomIndex, 0, randomWord);
    }

    const words = keywords.join(' ').split(' ');
    const shuffledWords = shuffleArray(words);
    const shuffledKeyword = shuffledWords.join(' ');
    return shuffledKeyword;
}

const apiKey = require("./Config.json").GOOGLE_CLOUD_API_KEY;
const cx = require("./Config.json").GOOGLE_CLOUD_CUSTOM_SEARCH_ENGINE_ID;
const num = 10;
async function fetchAndUpdateTotalImages() {
    if (isRateLimited) return;
    const keyword = getRandomKeyword();
    const imageLinks = await fetchImageLinks(keyword, apiKey, cx, num);
    saveImageLinksToFile(imageLinks);
}

setInterval(() => { 
    if (!isRateLimited) {
        fetchAndUpdateTotalImages();
    }
}, 50);

setInterval(() => {
    const imageData = JSON.parse(fs.readFileSync("./ScrapedImages.json", "utf-8"));
    logger.success('Total images scraped -> ' + Object.keys(imageData).length);
}, 10000);
