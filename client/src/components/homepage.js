import axios from 'axios';
import { useEffect, useState } from 'react';
import volcano from '../volcano.png';
import Leagues from './leagues';
import PlayerInfo from './playerInfo';
import Players from './players';
import Standings from './standings';
import allPlayers from '../allPlayers.json';
import Transactions from './transactions';

const Homepage = () => {
    const [group_value, setGroup_value] = useState('Total')
    const [group_age, setGroup_age] = useState('Total')
    const [seasons, setSeasons] = useState([])
    const [season, setSeason] = useState()
    const [leagues, setLeagues] = useState()
    const [transactions, setTransactions] = useState()
    const [dv, setDV] = useState([])
    const [tab, setTab] = useState('Standings')

    useEffect(() => {
        const fetchData = async () => {
            const state = await axios.get('/season')
            setSeason(state.data.season)
            setSeasons(state.data.seasons)
            const leagues = await axios.get('/leagues')
            setLeagues(leagues.data)
            const transactions = await axios.get('/transactions')
            setTransactions(transactions.data)
        }
        fetchData()
    }, [])

    const matchPlayer_DV = (player) => {
        const d = dv
        if (player === '0') {
            return 0
        } else {
            const match = d.find(x => x.id === player)
            if (match) {
                return match.updated_value
            } else {
                return 0
            }
        }
    }

    const matchPick = (season, round) => {
        const d = dv
        const match = d.find(x => `${season}mid${round}` === x.searchName.slice(0, 8))
        const value = match ? match.updated_value : 0
        return value
    }

    const getValue = (roster) => {
        let v;
        if (roster.players !== null) {
            switch (group_value) {
                case 'Total':
                    v = roster.players.reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0) +
                        roster.draft_picks.reduce((acc, cur) => acc + parseInt(matchPick(cur.season, cur.round)), 0)
                    break;
                case 'Players':
                    v = roster.players.reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'Picks':
                    v = roster.draft_picks.reduce((acc, cur) => acc + parseInt(matchPick(cur.season, cur.round)), 0)
                    break;
                case 'Starters':
                    v = roster.starters.reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'Bench':
                    v = roster.players.filter(x => !roster.starters.includes(x)).reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'QB':
                    v = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'RB':
                    v = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'WR':
                    v = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'TE':
                    v = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
                case 'FLEX':
                    v = roster.players.filter(x => ['RB', 'WR', 'TE'].includes(allPlayers[x].position)).reduce((acc, cur) => acc + parseInt(matchPlayer_DV(cur)), 0)
                    break;
            }
        } else {
            v = 0
        }
        return v
    }

    const getAge = (roster) => {
        let a;
        let length;
        if (roster.players !== null) {
            switch (group_age) {
                case 'Total':
                    a = roster.players.reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)) * allPlayers[cur].age, 0)
                    length = roster.players.reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)), 0)
                    break;
                case 'Starters':
                    a = roster.starters.filter(x => x !== '0').reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)) * allPlayers[cur].age, 0)
                    length = roster.starters.filter(x => x !== '0').reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)), 0)
                    break;
                case 'Bench':
                    a = roster.players.filter(x => !roster.starters.includes(x)).reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)) * allPlayers[cur].age, 0)
                    length = roster.players.filter(x => !roster.starters.includes(x)).reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)), 0)
                    break;
                case 'QB':
                    a = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)) * allPlayers[cur].age, 0)
                    length = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)), 0)
                    break;
                case 'RB':
                    a = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)) * allPlayers[cur].age, 0)
                    length = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)), 0)
                    break;
                case 'WR':
                    a = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)) * allPlayers[cur].age, 0)
                    length = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)), 0)
                    break;
                case 'TE':
                    a = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)) * allPlayers[cur].age, 0)
                    length = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)), 0)
                    break;
                case 'FLEX':
                    a = roster.players.filter(x => ['RB', 'WR', 'TE'].includes(allPlayers[x].position)).reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)) * allPlayers[cur].age, 0)
                    length = roster.players.filter(x => ['RB', 'WR', 'TE'].includes(allPlayers[x].position)).reduce((acc, cur) => acc + parseFloat(matchPlayer_DV(cur)), 0)
                    break;
            }
        } else {
            return '-'
        }
        return (a / length).toFixed(1)
    }

    return <>
        <div className="table_container">
            <div className='nav_container'>
                {seasons.map(league_season =>
                    <button
                        key={league_season}
                        className={league_season === season ? 'active_nav nav' : 'nav'}
                        onClick={() => setSeason(league_season)}
                    >
                        {league_season}
                    </button>
                )}
            </div>
            <h1>
                <div className='title_container'>
                    <img className='title_picture' alt='volcano' src={volcano} />
                    <p className='title'>Ring of Fire</p>
                </div>
            </h1>
            <div className='nav_container'>
                {['Standings', 'Leagues', 'Players', 'Transactions'].map((item, index) =>
                    <button
                        key={index}
                        className={tab === item ? 'active_nav nav' : 'nav'}
                        onClick={() => setTab(item)}
                    >
                        {item}
                    </button>
                )}
            </div>

            <div hidden={tab !== 'PlayerInfo'}>
                <PlayerInfo
                    leagues={leagues ? leagues[season] : []}
                    sendDV={(data) => setDV(data)}
                />
            </div>

            {tab !== 'Standings' ? null :
                <Standings
                    leagues={leagues ? leagues[season] : []}
                    matchPlayer_DV={matchPlayer_DV}
                    matchPick={matchPick}
                    getValue={getValue}
                    getAge={getAge}
                    sendValueType={(data) => setGroup_value(data)}
                    sendAgeType={(data) => setGroup_age(data)}
                    group_value={group_value}
                    group_age={group_age}
                />
            }

            {tab !== 'Leagues' ? null :
                <Leagues
                    leagues={leagues ? leagues[season] : []}
                    matchPick={matchPick}
                    matchPlayer_DV={matchPlayer_DV}
                    getValue={getValue}
                    getAge={getAge}
                    sendValueType={(data) => setGroup_value(data)}
                    sendAgeType={(data) => setGroup_age(data)}
                    group_value={group_value}
                    group_age={group_age}
                />
            }

            {tab !== 'Players' ? null :
                <Players
                    leagues={leagues ? leagues[season] : []}
                    matchPlayer_DV={matchPlayer_DV}
                    getValue={getValue}
                />
            }

            {tab !== 'Transactions' ? null :
                <Transactions
                    transactions={transactions ? transactions[season] : []}
                />
            }
        </div>
    </>
}

export default Homepage;