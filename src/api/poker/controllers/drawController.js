const expressAsyncHandler = require("express-async-handler");

const Card = require('../../../models/Card');

const drawCard = (cards) => {
    const randInt = Math.floor(Math.random() * cards.length)
    const cardArray = cards[randInt].split('_');
    const card = {
        'suit': cardArray[0],
        'card': cardArray[1]
    }
    cards.splice(randInt, 1);

    return [card, cards];
}

const drawCardForEveryone = (players, cards) => {
    const numOfPlayers = Object.keys(players).length
    for (let i = 1; i<=numOfPlayers; i++) {
        let card = null;
        [card, cards] = drawCard(cards);
        players[i].push(card);
    }

    return [players, cards]
}

exports.players = expressAsyncHandler (async (req, res, next) => {
    const json = req.body;
    const numOfPlayers = json.numOfPlayers;
    let cards = await Card.distinct('name').then(names => {
        return names;
    });

    let players = {}
    for (let i = 1; i<=numOfPlayers; i++) {
        players[i] = []
    }

    for (let i = 1; i<=2; i++) {
        [players, cards] = drawCardForEveryone(players, cards)
    }

    return res.json(players);
})

exports.board = expressAsyncHandler (async (req, res, next) => {
    const json = req.body;
    let cards = new Set(await Card.distinct('name').then(names => {
        return names;
    }));

    let usedCards = new Set();
    for (let key in json.hands) {
        if (json.hasOwnProperty(key)) {
            tempCards = json[key]
            for (let i = 0; i < tempCards.length; i++) {
                const card = tempCards[i];
                const suit = card.suit;
                const cardValue = card.card;
                usedCards.add(suit + "_" + cardValue);
            }
        }
    }

    let availableCards = Array.from(cards.difference(usedCards));
    let drawedCards = [];

    for (let i=0; i<json.numOfCards; i++) {
        let drawedCard = null;
        [drawedCard, availableCards] = drawCard(availableCards);
        drawedCards.push(drawedCard);
    }

    return res.json(drawedCards);
})