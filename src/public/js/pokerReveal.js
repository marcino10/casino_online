import { positionPlayers, pushChipFromPlayer } from "./pokerPlayers.js";
import {} from "./devPanel.js";
import {} from "./deckManager.js";

window.addEventListener('resize', positionPlayers);

positionPlayers();

const board = document.querySelector('.board');
const hand = document.querySelector('.player-hand');

document.addEventListener('DOMContentLoaded', () => {
    const mainPlayerHand = document.querySelector('.hand .player-hand');
    const mainPlayerCards = document.querySelectorAll('.hand .player-card');
    let mainCardsRevealed = false;

    if (mainPlayerHand) {
        mainPlayerHand.addEventListener('click', (e) => {
            if (e.target.closest('.player-card')) {
                mainCardsRevealed = !mainCardsRevealed;
                mainPlayerCards.forEach(card => {
                    card.classList.toggle('revealed', mainCardsRevealed);
                });
            }
        });
    }


    document.querySelector('.raise').addEventListener('click', () => {
        const activePlayer = document.querySelector('.player.active');
        if (activePlayer) {
            const playerIndex = Array.from(document.querySelectorAll('.player')).indexOf(activePlayer);
            pushChipFromPlayer(playerIndex);
        } else {
            const mainPlayer = document.querySelector('.hand');
            pushChipFromPlayer(1, mainPlayer);
        }
    });
});
