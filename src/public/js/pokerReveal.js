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

import { dealCard } from './animations.js';
import { deck, formatCardFilename } from './deckCore.js';

document.addEventListener('DOMContentLoaded', () => {
  const turnButton = document.getElementById('dev-turn');
  const board = document.querySelector('.board');
  const deckImage = document.querySelector('.deck img');

  turnButton.addEventListener('click', () => {
    if (!deck.length) return;

    const card = deck.pop();
    const img = document.createElement('img');
    img.classList.add('card');
    img.src = `/img/deck/${formatCardFilename(card)}`;
    img.alt = card;
    img.style.opacity = '0';

    board.appendChild(img);
    dealCard(deckImage, img, 0);
  });
});

// popup
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.querySelector(".pop-up");
  const helpIcon = document.querySelector("#helpIcon");
  const closeBtn = document.querySelector(".close_pop-up");

  helpIcon?.addEventListener("click", () => {
    popup?.classList.toggle("visible");
  });

  closeBtn?.addEventListener("click", () => {
    popup?.classList.remove("visible");
  });
});

