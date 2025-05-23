import { deck, generateDeck, shuffleDeck, burnCard, formatCardFilename } from './deckCore.js';
import { dealCard } from './animations.js';

function renderDeckList() {
    const container = document.getElementById('deck-list');
    if (!container) return;
    container.innerText = deck.join(', ');
}

function dealToPlayers() {
    const players = document.querySelectorAll('.player');
    const deckImage = document.querySelector('.deck img');
    let dealDelay = 0;

    players.forEach((player) => {
        const cards = player.querySelectorAll('.player-card');
        cards.forEach((cardContainer) => {
            const card = deck.pop();
            if (card) {
                const frontCard = cardContainer.querySelector('.front');
                frontCard.src = `/img/deck/${formatCardFilename(card)}`;
                frontCard.style.opacity = '0';
                
                dealCard(deckImage, frontCard, dealDelay);
                dealDelay += 150;
            }
        });
    });
    renderDeckList();
}

function dealToBoard() {
    const board = document.querySelector('.cards-container');
    const deckImage = document.querySelector('.deck img');
    if (!board || !deckImage) return;

    const card = deck.pop();
    if (!card) return;

    const img = document.createElement('img');
    img.classList.add('card');
    img.src = `/img/deck/${formatCardFilename(card)}`;
    img.alt = card;
    img.style.opacity = '0';

    board.appendChild(img);
    dealCard(deckImage, img, 0);
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
document.getElementById('burn-card').addEventListener('click', () => {
    burnCard();
    renderDeckList();
});
document.getElementById('deal-to-board').addEventListener('click', dealToBoard);

generateDeck();
renderDeckList();
