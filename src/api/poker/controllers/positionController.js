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

const getGroups = (values) => {
    let valuesGroups = {
        "one": [],
        "equal": {
            "two": new Set(),
            "three": new Set(),
            "four": new Set()
        },
        "consecutive": [],
    }

    let isLastConsecutiveUsed = false;
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        let prevValues = valuesGroups["one"];

        let equalGroups = valuesGroups["equal"];
        equalGroups = getEquals(value, prevValues, equalGroups);


        let consecutiveGroups = valuesGroups["consecutive"];
        [consecutiveGroups, isLastConsecutiveUsed] = getConsecutives(value, prevValues, consecutiveGroups, isLastConsecutiveUsed);

        prevValues.push(value);
    }

    return valuesGroups;
}

const getPlayerHands = (boardDeck, playerDeck) => {
    const deck = [...boardDeck, ...playerDeck];

    let colorGroups = [];
    let values = [];

    for (const card of deck) {
        const suit = card.suit;
        const cardValue = card.card;

        if (!colorGroups[suit]) {
            colorGroups[suit] = new Set();
        }

        colorGroups[suit].add(cardValue);
        values.push(nameToValue[cardValue]);
    }

    values.sort((a, b) => a - b);

    const valuesGroups = getGroups(values);

    console.log(valuesGroups);
}

exports.getPositions = expressAsyncHandler ( async (req, res, next)  => {
    const json = req.body;
    const boardDeck = json["0"];
    let players = json;
    delete players["0"];

    for (let key in players) {
        if (players.hasOwnProperty(key)) {
            const playerRankings = getPlayerHands(boardDeck, players[key]);
        }
    }

    return res.json(players);
});