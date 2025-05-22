import { positionPlayers } from "./pokerPlayers.js";

const socket = io();

const startBtn = document.querySelector('#start-game-btn');
const startStatus = document.querySelector('#start-status');
const waitingPopup = document.querySelector('#waiting');
const playerCards = document.querySelectorAll('.self-front');

const gameData = window.gameData;
const playerNick = gameData.nick;
let playersBySeats = gameData.playersBySeats;
let playerHand = gameData.playerHand;
let isStarted = window.isStarted;

const drawPlayers = () => {
    let playerIndex = playersBySeats.indexOf(playerNick);
    const players = playersBySeats.slice(playerIndex + 1).concat(playersBySeats.slice(0, playerIndex));

    positionPlayers(players);
    window.addEventListener('resize', () => {
        positionPlayers(players);
    });
}

const setPlayerCards = () => {
    for (let i = 0; i < playerCards.length; i++) {
        const card = playerHand[i];
        const cardElement = playerCards[i];
        cardElement.src = `/img/deck/${card.suit}_${card.value}_mobile.svg`;
    }
}

if (isStarted) {
    drawPlayers();
    setPlayerCards();
}

if (startBtn) {
    startBtn.addEventListener('click', () => {
        socket.emit('start-game');
    });
}

socket.on('start-status', (data) => {
    startStatus.textContent = data.message;
})

socket.on('game-started', (data) => {
    playersBySeats = data.players;
    playerHand = data.cards;
    drawPlayers();
    setPlayerCards();

    waitingPopup.style.display = 'none';
})
