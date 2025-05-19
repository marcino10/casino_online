import { deck, generateDeck, shuffleDeck, burnCard, formatCardFilename } from './deckCore.js';
import { dealCard } from './animations.js';

function renderDeckList() {
    const container = document.getElementById('deck-list');
    if (!container) return;
    container.innerText = deck.join(', ');
}


function dealToPlayers() {
    const players = document.querySelectorAll('.player');
    players.forEach((player) => {
        const cards = player.querySelectorAll('.player-card');
        cards.forEach((cardContainer) => {
            const card = deck.pop();
            if (card) {
                const frontCard = cardContainer.querySelector('.front');
                frontCard.src = `/img/deck/${formatCardFilename(card)}`;
            }
        });
    });
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

