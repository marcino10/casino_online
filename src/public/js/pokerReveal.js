import { positionPlayers, pushChipFromPlayer } from "./pokerPlayers.js";
import {} from "./devPanel.js";
import {} from "./deckManager.js";



window.addEventListener('resize', positionPlayers);


positionPlayers();


const board = document.querySelector('.board');
const hand = document.querySelector('.player-hand');


document.querySelector('.raise').addEventListener('click', () => {
    // Get active player index or default to 0
    const activePlayer = document.querySelector('.player.active');
    const playerIndex = activePlayer 
        ? Array.from(document.querySelectorAll('.player')).indexOf(activePlayer)
        : 1;
    pushChipFromPlayer(playerIndex);
});
