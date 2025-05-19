import { deck, generateDeck, shuffleDeck, burnCard, formatCardFilename } from './deckCore.js';

function renderDeckList() {
    const container = document.getElementById('deck-list');
    if (!container) return;
    container.innerText = deck.join(', ');
}

function dealToPlayers(numPlayers = 1) {
    const handDiv = document.querySelector('.player-hand');
    if (!handDiv) return;
    handDiv.innerHTML = '';

    for (let i = 0; i < numPlayers; i++) {
        const card1 = deck.pop();
        const card2 = deck.pop();
        [card1, card2].forEach(card => {
            const el = document.createElement('div');
            el.classList.add('player-card');
            el.innerHTML = `
              <img class="card hand-card front" src="/img/deck/${formatCardFilename(card)}" />
              <img class="card hand-card back" src="/img/deck/back_red.webp" />
            `;
            handDiv.appendChild(el);
        });
    }

    renderDeckList();
}

function dealToBoard(count = 5) {
    const boardDiv = document.querySelector('.board');
    if (!boardDiv) return;
    boardDiv.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const card = deck.pop();
        const img = document.createElement('img');
        img.classList.add('card');
        img.src = `/img/deck/${formatCardFilename(card)}`;
        img.alt = card;
        boardDiv.appendChild(img);
    }

    renderDeckList();
}


document.getElementById('reset-deck').addEventListener('click', () => {
    generateDeck();
    renderDeckList();
});
document.getElementById('shuffle-deck').addEventListener('click', () => {
    shuffleDeck();
    renderDeckList();
});
document.getElementById('deal-to-players').addEventListener('click', () => dealToPlayers(1));
document.getElementById('deal-to-board').addEventListener('click', () => dealToBoard());
document.getElementById('burn-card').addEventListener('click', () => {
    burnCard();
    renderDeckList();
});


generateDeck();
renderDeckList();
