import { positionPlayers, pushChipFromPlayer, setCards, deleteEventListenerForCardsReveal } from "./pokerPlayers.js";
import { initialize } from "./pokerGameInitialization.js";
import { dealCard } from "./animations.js";

export const createCardElement = (card) => {
    const suit = card.suit;
    const value = card.value;

    const cardElement = document.createElement('img');
    cardElement.classList.add('card');
    cardElement.src = `/img/deck/${suit}_${value}_mobile.svg`;
    cardElement.style.opacity = '0';

    return cardElement;
}

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
    const betValue = document.querySelector('#raise-bet-value');
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
    let tempCards = null;

    const drawPlayers = () => {
        let playerIndex = playersBySeats.indexOf(playerNick);
        const players = playersBySeats.slice(playerIndex).concat(playersBySeats.slice(0, playerIndex));

        positionPlayers(players, playersStates);
    }

    const updateInfo = () => {
        potValueElement.textContent = pot;
        turnValueElement.textContent = playersBySeats[activePlayerSeat - 1];
    }

    const updateView = () => {
        drawPlayers();
        initialize();
        updateInfo();

        window.addEventListener('resize', () => {
            updateView();
        });
    }

    const showPlayerBet = () => {
        const currentPlayer = document.querySelector(`#player-${playersBySeats[actionBySeat - 1]}`);
        const currentBet = currentPlayer.querySelector('.bet-value');
        const currentCredits = currentPlayer.querySelector('.balance-value');

        currentBet.textContent = currentPlayerBetValue;
        currentCredits.textContent = currentPlayerCredits;
    }

    console.log(playersStates)

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

        socket.emit('raise', {
            betValue: betValue
        })

        raisePanel.classList.remove('visible');
        setTimeout(() => {
            actionPanel.classList.add('visible');
        }, 300);
    });

    checkBtn.addEventListener('click', () => {
        socket.emit('call');
    });

    foldBtn.addEventListener('click', () => {
       socket.emit('fold');
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
        console.log(playersStates);

        updateView();
        showPlayerBet();

        waitingPopup.style.display = 'none';
    });

    socket.on('raised', (data) => {
        actionBySeat = data.ActionBySeat;
        activePlayerSeat = data.currentTurnSeat;
        currentBetValue = data.betValue;
        currentPlayerBetValue = data.betValue;
        currentPlayerCredits = data.creditsLeft;
        pot = data.pot;

        showPlayerBet();
        updateInfo();

        pushChipFromPlayer(data.seat, data.betValue);
    });

    socket.on('folded', async (data) => {
        actionBySeat = data.actionBySeat;
        activePlayerSeat = data.currentTurnSeat;
        tempCards = data.playerCards;
        const tempPlayerNick = playersBySeats[actionBySeat - 1];
        playersStates[tempPlayerNick].isFolded = true;
        playersStates[tempPlayerNick].hand = tempCards;

        const playerElement = document.querySelector(`#player-${playersBySeats[actionBySeat - 1]}`);
        const playerCards = playerElement.querySelectorAll('.player-card');

        setCards(playerElement, tempCards);
        playerCards.forEach(card => {
            card.classList.add('revealed');
        });

        if (tempPlayerNick === playerNick) {
            setTimeout(() => {
                const mainPlayer = document.querySelector('.player--main')
                deleteEventListenerForCardsReveal(mainPlayer);
            }, 1000);
        }
    });

    socket.on('new-turn', (data) => {
        tempCards = data.cards;

        for (let tempCard of tempCards) {
            dealCard(tempCard);
        }
    });
});


