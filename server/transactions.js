const express = require('express')
const app = express()
const axios = require('axios')

const getTransactions = async (seasons) => {
    const transactions = {}
    await Promise.all(seasons.map(async season => {
        const leagues = await axios.get(`https://api.sleeper.app/v1/user/435483482039250944/leagues/nfl/${season}`)
        let leaguesROF = leagues.data.filter(x => x.name.includes('Ring of Fire: '))
        let transactionsROF = []

        await Promise.all(leaguesROF.map(async league => {
            const [users, rosters, drafts] = await Promise.all([
                await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/users`),
                await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`),
                await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/drafts`)
            ])
            await Promise.all(Array.from(Array(17).keys()).map(async week => {
                const t = await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/transactions/${week + 1}`)
                t.data.map(trans => {
                    return transactionsROF.push({
                        ...trans,
                        league_name: league.name,
                        league_avatar: league.avatar,
                        users: trans.roster_ids.map(rid => {
                            const roster = rosters.data.find(x => x.roster_id === rid)
                            const user = users.data.find(x => x.user_id === roster.owner_id)
                            return {
                                roster_id: rid,
                                owner_id: user.user_id,
                                user_avatar: user.avatar,
                                username: user.display_name
                            }
                        }),
                        draft_picks: trans.draft_picks.map(pick => {
                            const pick_original_roster = rosters.data.find(x => x.roster_id === pick.roster_id)
                            const pick_original_user = users.data.find(x => x.user_id === pick_original_roster.owner_id)
                            const draft_order = drafts.data[0].draft_order[pick_original_user.user_id]
                            return {
                                ...pick,
                                original_username: pick_original_user.display_name,
                                order: draft_order
                            }
                        }),
                        isTransactionHidden: false
                    })
                })
            }))
        }))
        transactions[season] = transactionsROF
    }))
    return transactions
}

module.exports = { getTransactions }