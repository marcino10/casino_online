const expressAsyncHandler = require("express-async-handler");

const Card = require('../../../models/Card');

const nameToValue = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'j': 11,
    'q': 12,
    'k': 13,
    'a': 14
};

const valueToName = {
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'j',
    12: 'q',
    13: 'k',
    14: 'a'
}

const getConsecutives = (value, prevValues, groups, isLastNumberUsed) => {
    if (prevValues.length !== 0) {
        const lastValue = prevValues.at(-1);

        if (value !== lastValue) {
            if (!isLastNumberUsed) {
                if (value - 1 === lastValue) {
                    groups.push([lastValue, value]);
                    isLastNumberUsed = true;
                } else {
                    isLastNumberUsed = false;
                }
            } else {
                isLastNumberUsed = false;
            }

            for (let j = 0; j < groups.length; j++) {
                let group = groups[j];
                const lastValue = group.at(-1);
                if (value - 1 === lastValue) {
                    if (group.length < 5) {
                        group.push(value);
                    } else {
                        groups.push([...group.slice(1), value]);
                    }
                    isLastNumberUsed = true;
                }
            }
        }
    }

    return [groups, isLastNumberUsed];
}

const getEquals = (value, prevValues, groups) => {
    for (cardValue of groups["three"]) {
        if (value === cardValue) {
            groups["four"].add(value);
        }
    }

    for (cardValue of groups["two"]) {
        if (value === cardValue) {
            groups["three"].add(value);
        }
    }

    for (cardValue of prevValues) {
        if (value === cardValue) {
            groups["two"].add(value);
        }
    }

    return groups;
}

const getStraights = (groups) => {
    let straights = [];

    for (const group of groups) {
        if (group.length === 5) {
            straights.push(group);
        }
    }

    return straights
}

const getValueGroups = (values) => {
    let valuesGroups = {
        "one": [],
        "equal": {
            "two": new Set(),
            "three": new Set(),
            "four": new Set()
        },
        "straights": [],
    }

    let consecutiveGroups = [];

    let isLastConsecutiveUsed = false;
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        let prevValues = valuesGroups["one"];

        let equalGroups = valuesGroups["equal"];
        equalGroups = getEquals(value, prevValues, equalGroups);

        [consecutiveGroups, isLastConsecutiveUsed] = getConsecutives(value, prevValues, consecutiveGroups, isLastConsecutiveUsed);

        prevValues.push(value);
    }

    valuesGroups.straights = getStraights(consecutiveGroups);

    return valuesGroups;
}

const getHandGroups = (boardDeck, playerDeck) => {
    const deck = [...boardDeck, ...playerDeck];

    let suitGroups = [];
    let values = [];

    for (const card of deck) {
        const suit = card.suit;
        const cardValue = nameToValue[card.card];

        if (!suitGroups[suit]) {
            suitGroups[suit] = new Set();
        }

        suitGroups[suit].add(cardValue);
        values.push(cardValue);
    }

    values.sort((a, b) => a - b);

    const valuesGroups = getValueGroups(values);

    const handGroups = {
        "suits": {
            ...suitGroups
        },
        "values": valuesGroups
    }

    return handGroups;
}

const getHighestHandByValues = (straights) => {
    let highestStraight = straights[0];

    if (straights.length > 1) {
        for (let i = 1; i < straights.length; i++) {
            const currentStraight = straights[i];

            if (currentStraight.at(-1) > highestStraight.at(-1)) {
                highestStraight = currentStraight;
            }
        }
    }

    return highestStraight;
}

const getStraightFlush = (straights, suitGroups) => {

    const straightSets = straights.map(group => new Set(group));

    let straightFlushes = [];

    for (let i = 0; i < straightSets.length; i++) {
        const group = straightSets[i];

        for (const suit of suitGroups) {
            if (suit.size < 5) {
                continue;
            }

            if (suit.intersection(group)) {
                straightFlushes.push(straights[i]);
            }
        }
    }

    if (straightFlushes.length > 0) {
        return getHighestHandByValues(straightFlushes);
    }

    return false;
}

const getFlushes = (groups) => {
    for (const group of groups) {
        if (group.size >= 5) {
            return [group]
        }
    }

    return [];
}

const getHighestFiveCards = (cards) => {
    if (!Array.isArray(cards)) {
        cards = Array.from(cards);
    }

    cards.sort((a, b) => b - a);

    return cards.slice(0,5);
}

const getQuad = (groups) => {
    if (groups.size > 0) {
        return Array.from(groups);
    }

    return [];
}

const getSortedTrips = (groups) => {
    if (groups.size > 0) {
        let trips = Array.from(groups);
        trips.sort((a, b) => a - b);

        return trips;
    }

    return [];
}

const getSortedPairs = (groups) => {
    if (groups.size > 0) {
        let pairs = Array.from(groups);
        pairs.sort((a, b) => a - b);

        return pairs;
    }

    return [];
}

const mapValuesToNames = (cards) => {
    return cards.map(card => valueToName[card]);
}

const getPlayerBestHand = (boardDeck, players) => {
    const handGroups = getHandGroups(boardDeck, players);

    const suitGroupsJson = handGroups.suits;
    let allCards = handGroups.values.one;
    allCards.sort((a, b) => b - a);

    let suitGroups = [];
    for (const suit in suitGroupsJson) {
        if(suitGroupsJson.hasOwnProperty(suit)) {
            suitGroups.push(suitGroupsJson[suit]);
        }
    }

    const straights = handGroups.values.straights;
    const equalsGroups = handGroups.values.equal;

    const returnTemplate = {
        "rankingName": "",
        "rankingValue": 0,
        "cardsValues": allCards,
        "cardsNames": mapValuesToNames(allCards),
        "cardsInHighestRankingValues": [],
        "cardsInHighestRankingNames": [],
    }

    const straightFlush = getStraightFlush(straights, suitGroups);
    if (straightFlush !== false) {
        returnTemplate.rankingName = "straight flush";
        returnTemplate.rankingValue = 9;
        returnTemplate.cardsInHighestRankingValues = straightFlush;
        returnTemplate.cardsInHighestRankingNames = mapValuesToNames(straightFlush);

        return returnTemplate;
    }

    const quad = getQuad(equalsGroups.four);
    const sortedTrips = getSortedTrips(equalsGroups.three);
    const sortedPairs = getSortedPairs(equalsGroups.two);

    if (quad.length > 0) {
        returnTemplate.rankingName = "four of a kind";
        returnTemplate.rankingValue = 8;
        returnTemplate.cardsInHighestRankingValues = [quad.at(-1)];
        returnTemplate.cardsInHighestRankingNames = mapValuesToNames(quad.at(-1));

        return returnTemplate;
    }

    if (sortedTrips.length > 0 && sortedPairs.length > 0) {
        const highestTrip = sortedTrips.at(-1);

        let highestPair;
        for (let i = sortedPairs.length - 1; i >= 0; i--) {
            const pair = sortedPairs[i];
            if (pair !== highestTrip) {
                highestPair = pair;
                break;
            }
        }

        if (highestPair !== undefined) {
            returnTemplate.rankingName = "full house";
            returnTemplate.rankingValue = 7;
            returnTemplate.cardsInHighestRankingValues = [highestTrip, highestPair];
            returnTemplate.cardsInHighestRankingNames = mapValuesToNames([highestTrip, highestPair]);

            return returnTemplate;
        }
    }

    const flushes = getFlushes(suitGroups);

    if (flushes.length > 0) {
        const flushCards = getHighestFiveCards(flushes[0]);

        returnTemplate.rankingName = "flush";
        returnTemplate.rankingValue = 6;
        returnTemplate.cardsInHighestRankingValues = flushCards;
        returnTemplate.cardsInHighestRankingNames = mapValuesToNames(flushCards);

        return returnTemplate;
    }

    if (straights.length > 0) {
        const highestStraight = getHighestHandByValues(straights);

        returnTemplate.rankingName = "straight";
        returnTemplate.rankingValue = 5;
        returnTemplate.cardsInHighestRankingValues = highestStraight;
        returnTemplate.cardsInHighestRankingNames = mapValuesToNames(highestStraight);

        return returnTemplate;
    }

    if (sortedTrips.length > 0) {
        const highestTrip = sortedTrips.at(-1);

        returnTemplate.rankingName = "three of a kind";
        returnTemplate.rankingValue = 4;
        returnTemplate.cardsInHighestRankingValues = [highestTrip];
        returnTemplate.cardsInHighestRankingNames = mapValuesToNames([highestTrip]);

        return returnTemplate;
    }

    if (sortedPairs.length > 1) {
        const highestPair = sortedPairs.at(-1);
        const secondHighestPair = sortedPairs.at(-2);

        returnTemplate.rankingName = "two pair";
        returnTemplate.rankingValue = 3;
        returnTemplate.cardsInHighestRankingValues = [highestPair, secondHighestPair];
        returnTemplate.cardsInHighestRankingNames = mapValuesToNames([highestPair, secondHighestPair]);

        return returnTemplate;
    }

    if (sortedPairs.length > 0) {
        const highestPair = sortedPairs.at(-1);

        returnTemplate.rankingName = "one pair";
        returnTemplate.rankingValue = 2;
        returnTemplate.cardsInHighestRankingValues = [highestPair];
        returnTemplate.cardsInHighestRankingNames = mapValuesToNames([highestPair]);

        return returnTemplate;
    }

    returnTemplate.rankingName = "high card";
    returnTemplate.rankingValue = 1;
    returnTemplate.cardsInHighestRankingValues = returnTemplate.cardsValues;
    returnTemplate.cardsInHighestRankingNames = returnTemplate.cardsNames;

    return returnTemplate;
}

const getPlayersBestHand = (players, boardDeck) => {
    let playersRankings = {};

    for (let key in players) {
        if (players.hasOwnProperty(key)) {
            const playerRanking = getPlayerBestHand(boardDeck, players[key]);

            playersRankings[key] = playerRanking;
        }
    }

    return playersRankings
}

const getPlayersPositions = (playersRankings) => {
    let playersPositions = [];
    let rankingsToPlayers = {};

    for (let key in playersRankings) {
        if (playersRankings.hasOwnProperty(key)) {
            if (playersRankings.hasOwnProperty(key)) {
                const playerRanking = playersRankings[key];
                const rankingValue = playerRanking.rankingValue;

                if (!rankingsToPlayers.hasOwnProperty(rankingValue)) {
                    rankingsToPlayers[rankingValue] = [];
                }

                rankingsToPlayers[rankingValue].push(key);
            }
        }

    }

    for (let i = 9; i >= 1; i--) {
        if (rankingsToPlayers.hasOwnProperty(i)) {
            const players = rankingsToPlayers[i];

            let currentRankingPositions = [];
            for (let j = 0; j < players.length; j++) {
                const currentPlayer = players[j];
                const currentPlayerCards = playersRankings[currentPlayer].cardsInHighestRankingValues;

                if (j === 0) {
                    currentRankingPositions.push(currentPlayer);
                    continue;
                }

                outerLoop: for (let k = 0; k < currentRankingPositions.length; k++) {

                    const prevPlayer = currentRankingPositions[k];
                    const prevPlayerCards = playersRankings[prevPlayer].cardsInHighestRankingValues;

                    for (let l = 0; l < currentPlayerCards.length; l++) {
                        const currentPlayerCard = currentPlayerCards[l];
                        const prevPlayerCard = prevPlayerCards[l];

                        if (currentPlayerCard > prevPlayerCard) {
                            currentRankingPositions.splice(k, 0, currentPlayer);
                            break outerLoop;

                        } else if (currentPlayerCard < prevPlayerCard) {
                            if (k === currentRankingPositions.length - 1) {
                                currentRankingPositions.push(currentPlayer);
                                break outerLoop;
                            }

                            continue outerLoop;

                        } else {
                            if (l === currentPlayerCards.length - 1 && k === currentRankingPositions.length - 1) {
                                currentRankingPositions.push(currentPlayer);
                                break outerLoop;
                            }
                        }
                    }
                }

            }

            playersPositions.push(...currentRankingPositions);
        }
    }

    return playersPositions;
}

exports.getPositions = expressAsyncHandler ( async (req, res, next)  => {
    const json = req.body;
    const boardDeck = json["0"];
    let players = json;
    delete players["0"];

    const rankings = getPlayersBestHand(players, boardDeck);
    const positions = getPlayersPositions(rankings);

    const respond = {
        "playersPositions": positions,
        "playersBestHands": rankings
    }

    return res.json(respond);
});