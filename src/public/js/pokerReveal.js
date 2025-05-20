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

document.addEventListener('DOMContentLoaded', () => {
  const turnButton = document.getElementById('dev-turn');
  const turnCard = document.getElementById('turnCard');
  const deckImage = document.querySelector('.deck img');

  turnCard.style.opacity = '0';

  turnButton.addEventListener('click', () => {
    dealCard(deckImage, turnCard);
  });
});
