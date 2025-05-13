const Card = require('../models/Card');

const suits = ['heart', 'diamond', 'club', 'spade'];
const values = [
    { value: 2, name: '2' },
    { value: 3, name: '3' },
    { value: 4, name: '4' },
    { value: 5, name: '5' },
    { value: 6, name: '6' },
    { value: 7, name: '7' },
    { value: 8, name: '8' },
    { value: 9, name: '9' },
    { value: 10, name: '10' },
    { value: 11, name: 'J' },
    { value: 12, name: 'Q' },
    { value: 13, name: 'K' },
    { value: 14, name: 'A' },
];

async function up() {
    let cards = [];

    for (const suit of suits) {
        for (const { value, name } of values) {
            const cardName = `${name} of ${suit}s`;
            cards.push({
                humanName: cardName,
                suit: suit,
                value: value,
                name: `${suit}_${name}`.toLowerCase(),
            });
        }
    }

    await Card.insertMany(cards);
    console.log('✅ Card migration completed');
}

async function down() {
    await Card.deleteMany({});
    console.log('✅ Card migration rolled back');
}

module.exports = { up, down };
