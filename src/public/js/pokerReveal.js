import { positionPlayers } from "./pokerPlayers.js";
import {} from "./devPanel.js";
import {} from "./deckManager.js";



window.addEventListener('resize', positionPlayers);


positionPlayers();


const board = document.querySelector('.board');
const hand = document.querySelector('.player-hand');


document.querySelector('.raise').addEventListener('click', () => {
    const player = document.querySelector('.player.active');
    const pot = document.querySelector('.pot');
    betChip(player, pot, 100);
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


