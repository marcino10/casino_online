import { positionPlayers, pushChipFromPlayer } from "./pokerPlayers.js";
import {initialize} from "./pokerGameInitialization.js";
import {foldPlayerCards} from "./animations.js";

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const startBtn = document.querySelector('#start-game-btn');
    const startStatus = document.querySelector('#start-status');
    const waitingPopup = document.querySelector('#waiting');
    const foldBtn = document.querySelector('#fold-btn');
    const checkBtn = document.querySelector('#check-btn');
    const potValueElement = document.querySelector('#pot-value')
    const turnValueElement = document.querySelector('#turn-value');

    const actionPanel = document.querySelector('.action-panel');
    const raisePanel = document.querySelector('.raise-panel');
    const raiseButton = document.querySelector('.raise');
    const confirmRaiseButton = document.querySelector('.confirm-raise');
    const cancelRaiseButton = document.querySelector('.cancel-raise');
    const betSlider = document.querySelector('.bet-slider');
    const betValue = document.querySelector('.bet-value');
    const quickBets = document.querySelectorAll('.quick-bet');

    const gameData = window.gameData;
    const playerNick = gameData.nick;
    let isStarted = window.isStarted;
    let playersBySeats = gameData.playersBySeats;
    let playersStates = gameData.playersStates;
    let currentBetValue = gameData.currentBet;
    let pot = gameData.pot;
    let activePlayerSeat = gameData.currentTurnSeat;
    let actionBySeat = null;
    let currentPlayerBetValue = null;
    let currentPlayerCredits = null;

    console.log(playersStates)

    const drawPlayers = () => {
        let playerIndex = playersBySeats.indexOf(playerNick);
        const players = playersBySeats.slice(playerIndex).concat(playersBySeats.slice(0, playerIndex));

        positionPlayers(players, playersStates);
        window.addEventListener('resize', () => {
            positionPlayers(players, playersStates);
        });
    }

    const updateInfo = () => {
        potValueElement.textContent = pot;
        turnValueElement.textContent = playersBySeats[activePlayerSeat - 1];
    }

    const updateView = () => {
        drawPlayers();
        initialize();
        updateInfo();
    }

    const showPlayerBet = () => {
        const currentPlayer = document.querySelector(`#player-${playersBySeats[actionBySeat - 1]}`);
        const currentBet = currentPlayer.querySelector('.bet-value');
        const currentCredits = currentPlayer.querySelector('.balance-value');

        currentBet.textContent = currentPlayerBetValue;
        currentCredits.textContent = currentPlayerCredits;
    }

    // Initialize the action panel as visible
    setTimeout(() => {
        actionPanel.classList.add('visible');
    }, 100);

    raiseButton.addEventListener('click', () => {
        actionPanel.classList.remove('visible');
        setTimeout(() => {
            raisePanel.classList.add('visible');
        }, 300);
    });

    betSlider.addEventListener('input', (e) => {
        betValue.textContent = `$${e.target.value}`;
    });

    quickBets.forEach(button => {
        button.addEventListener('click', () => {
            const amount = button.dataset.amount;
            betSlider.value = amount;
            betValue.textContent = `$${amount}`;
        });
    });

    cancelRaiseButton.addEventListener('click', () => {
        raisePanel.classList.remove('visible');
        setTimeout(() => {
            actionPanel.classList.add('visible');
        }, 300);
    });

    confirmRaiseButton.addEventListener('click', () => {
        const betValue = parseInt(betSlider.value);

        pushChipFromPlayer(1, betValue);

        socket.emit('raise', {
            betValue: betValue
        })

        // raisePanel.classList.remove('visible');
        // setTimeout(() => {
        //     actionPanel.classList.add('visible');
        // }, 300);
    });

    foldBtn.addEventListener('click', () => {

        const playerIndex = 0;
        foldPlayerCards(playerIndex);
        socket.emit('fold');


        actionPanel.classList.remove('visible');
    });

    checkBtn.addEventListener('click', () => {
        socket.emit('call');
    });

    if (isStarted) {
        updateView();
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
        playersStates = data.playersStates;
        currentBetValue = data.betValue;
        currentPlayerBetValue = data.betValue;
        currentPlayerCredits = data.creditsLeft
        activePlayerSeat = data.currentTurnSeat;
        actionBySeat = data.ActionBySeat;
        pot = data.pot;

        updateView();
        showPlayerBet();

        waitingPopup.style.display = 'none';
    });

    socket.on('raised', (data) => {
        actionBySeat = data.ActionBySeat;
        currentBetValue = data.betValue;
        currentPlayerBetValue = data.betValue;
        currentPlayerCredits = data.creditsLeft;
        pot = data.pot;

        showPlayerBet();
        updateInfo();

        pushChipFromPlayer(data.seat, data.betValue);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const popup = document.querySelector('.pop-up');
    const closePopup = document.querySelector('.close-popup');
    const helpIcon = document.querySelector('.help-circle');

    helpIcon.addEventListener('click', () => {
        popup.classList.add('visible');
    });

    closePopup.addEventListener('click', () => {
        popup.classList.remove('visible');
    });

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('visible');
        }
    });
});