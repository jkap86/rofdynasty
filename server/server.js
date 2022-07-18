const express = require('express');
const path = require('path')
const app = express()
const cors = require('cors')
const axios = require('axios')
const fs = require('fs')
const http = require('http')
const dv = require('./dynastyValues')
const { getState, getLeagues, getLeagueDetails } = require('./fetchData')
const { getTransactions } = require('./transactions')

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

setInterval(() => {
    http.get('http://rofdynasty.herokuapp.com/');
}, 1000 * 60 * 29)

const getAllPlayers = async () => {
    let allplayers = await axios.get('https://api.sleeper.app/v1/players/nfl', { timeout: 3000 })
    let ap = JSON.stringify(allplayers.data)
    fs.writeFileSync('../client/src/allPlayers.json', ap)
}
getAllPlayers()
setInterval(getAllPlayers, 1000 * 60 * 60 * 24)

const fetchData = async () => {
    const { year, season, seasons } = await getState()
    app.set('year', year)
    app.set('season', season)
    app.set('seasons', seasons)
    const leagues = await getLeagues(seasons)
    app.set('leagues', leagues)
    const leagues_details = await getLeagueDetails(leagues)
    app.set('leagues', leagues_details)
    const transactions = await getTransactions(seasons)
    app.set('transactions', transactions)
}

fetchData()

setInterval(fetchData, 1000 * 60 * 5)

app.get('/season', async (req, res) => {
    const year = app.settings.year
    const season = app.settings.season
    const seasons = app.settings.seasons
    res.send({
        year: year,
        season: season,
        seasons: seasons
    })
})

app.get('/leagues', async (req, res) => {
    const leagues = app.settings.leagues
    res.send(leagues)
})

app.get('/transactions', async (req, res) => {
    const transactions = app.settings.transactions
    res.send(transactions)
})

app.get('/dynastyvalues', dv)


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});