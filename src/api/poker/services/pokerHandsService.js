const deckOrganizer = require("./deckOrganizer");
const cardsTranslator = require("./cardsTranslator");
const getHighestHandByValues = (hands) => {
    let highestHand = hands[0];

    if (hands.length > 1) {
        for (let i = 1; i < hands.length; i++) {
            const currentStraight = hands[i];

            if (currentStraight.at(-1) > highestHand.at(-1)) {
                highestHand = currentStraight;
            }
        }
    }

    return highestHand;
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

    return cards.slice(0, 5);
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

const getPlayerBestHand = (boardDeck, players) => {
    const handGroups = deckOrganizer.getHandGroups(boardDeck, players);

    const suitGroupsJson = handGroups.suits;
    let allCards = handGroups.values.one;
    allCards.sort((a, b) => b - a);

    let suitGroups = [];
    for (const suit in suitGroupsJson) {
        if (suitGroupsJson.hasOwnProperty(suit)) {
            suitGroups.push(suitGroupsJson[suit]);
        }
    }

    const straights = handGroups.values.straights;
    const equalsGroups = handGroups.values.equal;

    const returnTemplate = {
        "rankingName": "",
        "rankingValue": 0,
        "cardsValues": allCards,
        "cardsNames": cardsTranslator.mapValuesToNames(allCards),
        "cardsInHighestRankingValues": [],
        "cardsInHighestRankingNames": [],
    }

    const straightFlush = getStraightFlush(straights, suitGroups);
    if (straightFlush !== false) {
        returnTemplate.rankingName = "straight flush";
        returnTemplate.rankingValue = 9;
        returnTemplate.cardsInHighestRankingValues = straightFlush;
        returnTemplate.cardsInHighestRankingNames = cardsTranslator.mapValuesToNames(straightFlush);

        return returnTemplate;
    }

    const quad = getQuad(equalsGroups.four);
    const sortedTrips = getSortedTrips(equalsGroups.three);
    const sortedPairs = getSortedPairs(equalsGroups.two);

    if (quad.length > 0) {
        returnTemplate.rankingName = "four of a kind";
        returnTemplate.rankingValue = 8;
        returnTemplate.cardsInHighestRankingValues = [quad.at(-1)];
        returnTemplate.cardsInHighestRankingNames = cardsTranslator.mapValuesToNames(quad.at(-1));

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
            returnTemplate.cardsInHighestRankingNames = cardsTranslator.mapValuesToNames([highestTrip, highestPair]);

            return returnTemplate;
        }
    }

    const flushes = getFlushes(suitGroups);

    if (flushes.length > 0) {
        const flushCards = getHighestFiveCards(flushes[0]);

        returnTemplate.rankingName = "flush";
        returnTemplate.rankingValue = 6;
        returnTemplate.cardsInHighestRankingValues = flushCards;
        returnTemplate.cardsInHighestRankingNames = cardsTranslator.mapValuesToNames(flushCards);

        return returnTemplate;
    }

    if (straights.length > 0) {
        const highestStraight = getHighestHandByValues(straights);

        returnTemplate.rankingName = "straight";
        returnTemplate.rankingValue = 5;
        returnTemplate.cardsInHighestRankingValues = highestStraight;
        returnTemplate.cardsInHighestRankingNames = cardsTranslator.mapValuesToNames(highestStraight);

        return returnTemplate;
    }

    if (sortedTrips.length > 0) {
        const highestTrip = sortedTrips.at(-1);

        returnTemplate.rankingName = "three of a kind";
        returnTemplate.rankingValue = 4;
        returnTemplate.cardsInHighestRankingValues = [highestTrip];
        returnTemplate.cardsInHighestRankingNames = cardsTranslator.mapValuesToNames([highestTrip]);

        return returnTemplate;
    }

    if (sortedPairs.length > 1) {
        const highestPair = sortedPairs.at(-1);
        const secondHighestPair = sortedPairs.at(-2);

        returnTemplate.rankingName = "two pair";
        returnTemplate.rankingValue = 3;
        returnTemplate.cardsInHighestRankingValues = [highestPair, secondHighestPair];
        returnTemplate.cardsInHighestRankingNames = cardsTranslator.mapValuesToNames([highestPair, secondHighestPair]);

        return returnTemplate;
    }

    if (sortedPairs.length > 0) {
        const highestPair = sortedPairs.at(-1);

        returnTemplate.rankingName = "one pair";
        returnTemplate.rankingValue = 2;
        returnTemplate.cardsInHighestRankingValues = [highestPair];
        returnTemplate.cardsInHighestRankingNames = cardsTranslator.mapValuesToNames([highestPair]);

        return returnTemplate;
    }

    returnTemplate.rankingName = "high card";
    returnTemplate.rankingValue = 1;
    returnTemplate.cardsInHighestRankingValues = returnTemplate.cardsValues;
    returnTemplate.cardsInHighestRankingNames = returnTemplate.cardsNames;

    return returnTemplate;
}

module.exports = {
    getPlayerBestHand,
}