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
    const deckElement = document.querySelector('.deck img');
    if (!boardDiv || !deckElement) return;

    boardDiv.appendChild(img);


    for (let i = 0; i < count; i++) {
        const card = deck.pop();
        if (!card) continue;

        const img = document.createElement('img');
        img.classList.add('card');
        img.src = `/img/deck/${formatCardFilename(card)}`;
        img.alt = card;
        img.style.opacity = '0';

        boardDiv.appendChild(img);

        dealCard(deckElement, img, i * 150);
        dealCard(deckElement, img, i * 200);

    }

    renderDeckList();
}

function clearChips() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        // Force reflow to ensure transition works
        chip.offsetHeight;
        chip.style.opacity = '0';
        chip.addEventListener('transitionend', () => {
            if (chip.parentElement) {
                chip.remove();
            }
        }, { once: true });
    });
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

