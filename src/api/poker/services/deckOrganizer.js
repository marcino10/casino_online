const cardsTranslator = require("./cardsTranslator");

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
        const cardValue = cardsTranslator.mapNamesToValues([card.value])[0];

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

module.exports = {
    getHandGroups,
}