const express = require('express')
const redis = require('redis')

const port = 3000

const app = express()
app.use(express.json())
const redisClient = redis.createClient()

redisClient.on('error', function (error) {
    console.error(error)
})

app.get('/github',async function (req, res ) {
    const apicalls =  await redisClient.get('api-calls')

    if (apicalls >= 10 ) {
        res.status(429).send('Trop de requête')
        return
    }
    await redisClient.incr('api-calls')
    //await redisClient.set('github', 'Hello World')
    // const response = await fetch('https://api.github.com/users/Bouwa3')
    // const json = await response.json()

    res.send('apicalls:' + apicalls)

    // commencer par un chrono
    let start = performance.now();
    const cacheKey = 'github-cache';

    const cachedResponse = await redisClient.get(cacheKey)
    let result = null
    let fromcache = false

    if (cachedResponse === null) {
        const response = await fetch('https://api.github.com/users/Bouwa3')
        result = await response.json()

        // Mettre en cache la réponse dans Redis
        await redisClient.set(cacheKey, JSON.stringify(result))
    } else {
        fromcache = true;
        result = JSON.parse(cachedResponse)
    }

    let timeTaken = performance.now() - start;
    // Arrêter le chrono

    res.send({
        timeTaken, fromcache, result
    })
    app.get('/top3', async (req, res) => {

    })
    app.post('/players', async(req, res) => {
        const { name, score } = req.body
    console.log({ name, score })

    // comment ajouter un joueur dans la liste 
    await redisClient.zAdd('players',score, name)
    res.send('OK')
    })

    app.listen(port, async () => {
        await redisClient.connect()
        console.log(`API is started on https://localhost:${port}`)
    });

})


