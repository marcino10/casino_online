import { positionPlayers } from "./pokerPlayers.js";

const socket = io();

const startBtn = document.querySelector('#start-game-btn');
const startStatus = document.querySelector('#start-status');
const waitingPopup = document.querySelector('#waiting');
const playerCards = document.querySelectorAll('.self-front');
const foldBtn = document.querySelector('#fold-btn');
const checkBtn = document.querySelector('#check-btn');
const raiseBtn = document.querySelector('#raise-btn');

const gameData = window.gameData;
const playerNick = gameData.nick;
let playersBySeats = gameData.playersBySeats;
let isStarted = window.isStarted;
let playerHand = gameData.playersStates[playerNick].hand;
console.log(playerHand);
let currentBetValue = gameData.currentBet;
let pot = gameData.pot;
let activePlayer = gameData.activePlayer;
let currentPlayerBetValue = null;
let currentPlayerCredits = null;

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

const showPlayerBet = () => {
    if (activePlayer === playerNick) {
        return;
    }

    const currentPlayer = document.querySelector(`#player-${activePlayer}`);
    const currentBet = currentPlayer.querySelector('.player-bet');
    const currentCredits = currentPlayer.querySelector('.player-credits');

    currentBet.textContent = currentPlayerBetValue;
    currentCredits.textContent = currentPlayerCredits;
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
    currentBetValue = data.betValue;
    activePlayer = data.ActionBy;
    currentPlayerBetValue = data.betValue;
    currentPlayerCredits = data.creditsLeft
    pot = data.pot;

    drawPlayers();
    setPlayerCards();
    showPlayerBet();

    waitingPopup.style.display = 'none';
})
