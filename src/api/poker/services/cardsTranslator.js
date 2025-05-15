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

const mapValuesToNames = (cards) => {
    return cards.map(card => valueToName[card]);
}

const mapNamesToValues = (cards) => {
    return cards.map(card => nameToValue[card]);
}

module.exports = {
    mapValuesToNames,
    mapNamesToValues
}