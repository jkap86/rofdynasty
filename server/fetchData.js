const express = require('express')
const app = express()
const axios = require('axios')


const getState = async () => {
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl');
    const year = state.data.season - 2020
    const seasons = Array.from(Array(year).keys()).map(x => x + 2021).sort((a, b) => b - a);
    return {
        year: year,
        season: parseInt(state.data.season),
        seasons: seasons
    }
}


const getLeagues = async (seasons) => {
    let leagues = {}
    await Promise.all(seasons.map(async s => {
        const l = await axios.get(`https://api.sleeper.app/v1/user/435483482039250944/leagues/nfl/${s}`)
        leagues[s] = l.data.filter(x => x.name.includes('Ring of Fire: '))
    }))
    return leagues
}



const getLeagueDetails = async (leagues_all) => {
    const getDraftPicks = (league, roster_id, season, traded_picks) => {
        let original_picks = []
        let y = league.status === 'in_season' ? 1 : 0
        Array.from(Array(3).keys()).map(x => x + y).map(year => {
            return Array.from(Array(league.settings.draft_rounds).keys()).map(x => x + 1).map(round => {
                return original_picks.push({
                    season: (parseInt(season) + parseInt(year)).toString(),
                    round: round,
                    roster_id: roster_id,
                    previous_owner_id: roster_id,
                    owner_id: roster_id
                })
            })
        })


        traded_picks.filter(x => x.owner_id === roster_id).map(pick => {
            return original_picks.push(pick)
        })
        traded_picks.filter(x => x.previous_owner_id === roster_id).map(pick => {
            const index = original_picks.findIndex(obj => {
                return obj.owner_id === pick.previous_owner_id && obj.roster_id === pick.roster_id && obj.season === pick.season && obj.round === pick.round
            })
            if (index !== -1) {
                return original_picks.splice(index, 1)
            }

        })

        return league.status === 'in_season' ? original_picks.filter(x => x.season >= season + y) : original_picks
    }
    let leagues = {}
    await Promise.all(Object.keys(leagues_all).map(async season => {
        const league_details = await Promise.all(leagues_all[season].map(async league => {
            const [rosters, users, traded_picks, drafts] = await Promise.all([
                await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`),
                await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/users`),
                await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/traded_picks`),
                await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/drafts`)
            ])
            return {
                ...league,
                rosters: rosters.data.map(roster => {
                    return {
                        ...roster,
                        draft_picks: getDraftPicks(league, roster.roster_id, season, traded_picks.data),
                        username: users.data.find(x => x.user_id === roster.owner_id)?.display_name,
                        user_avatar: users.data.find(x => x.user_id === roster.owner_id)?.avatar,
                        league_name: league.name,
                        league_avatar: league.avatar
                    }
                }),
                users: users.data,
                drafts: drafts.data,
                isLeagueHidden: false,
                isRostersHidden: true
            }
        }))
        leagues[season] = league_details
    }))
    return leagues
}

module.exports = {
    getState,
    getLeagues,
    getLeagueDetails
}
