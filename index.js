const express = require('express');
const redis = require('redis');
var cors = require('cors')
const app = express();
app.use(cors())
const port = 3333;
let redisClient;
(async () => {
    redisClient = redis.createClient();
    redisClient.on("error", (error) => console.error(`Error : ${error}`));
    await redisClient.connect();
})();

redisClient.on('connect', function () {
    console.log('Connected!'); // Connected!
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/clipboard/saveclipboard', async (req, res) => {
    const data = { ip: req.body.hostname ? req.body.hostname : "n/a", data: req.body.text };
    try {
        const cacheResults = await redisClient.get('clipboardData');
        if (cacheResults) {
            let cacheData = JSON.parse(cacheResults);
            const len = cacheData.length;
            if (cacheData[len - 1].data === data.data && cacheData[len - 1].ip === data.ip) {
            } else {
                cacheData.push(data);
                await redisClient.set('clipboardData', JSON.stringify(cacheData));
            }
        } else {
            await redisClient.set('clipboardData', JSON.stringify([data]));
        }
        res.json({ msg: 'data successflly saved' });
    } catch (err) {
        console.log("error: ", err)
    }
});

app.get('/clipboard/getclipboard', async (req, res) => {
    try {
        const cacheResults = await redisClient.get('clipboardData');
        res.json(JSON.parse(cacheResults))
    } catch (err) {
        console.log("Error while fetching data: ", err)
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
