const suits = ['h', 'd', 'c', 's'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];

export let deck = [];

export function generateDeck() {
    deck = [];
    for (let s of suits) {
        for (let r of ranks) {
            deck.push(r + s);
        }
    }
}

export function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

export function burnCard() {
    deck.pop();
}

export function formatCardFilename(card) {
    const mapSuit = { h: 'heart', d: 'diamond', c: 'club', s: 'spade' };
    const [_, rank, suit] = card.match(/([0-9jqka]+)([hdcs])/i);
    return `${mapSuit[suit]}_${rank}_mobile.svg`;
}
