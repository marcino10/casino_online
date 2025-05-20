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