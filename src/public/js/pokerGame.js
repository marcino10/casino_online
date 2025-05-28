import { positionPlayers, pushChipFromPlayer, setCards, deleteEventListenerForCardsReveal } from "./pokerPlayers.js";
import { initialize } from "./pokerGameInitialization.js";
import { dealCard } from "./animations.js";
import {foldPlayerCards} from "./animations.js";

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
    const cardsContainer = document.querySelector('#boardCards');
    const numOfPlayersElement = document.querySelector('#num-of-players');

    const actionPanel = document.querySelector('.action-panel');
    const raisePanel = document.querySelector('.raise-panel');
    const raiseButton = document.querySelector('.raise');
    const confirmRaiseButton = document.querySelector('.confirm-raise');
    const cancelRaiseButton = document.querySelector('.cancel-raise');
    const betSlider = document.querySelector('.bet-slider');
    const betValue = document.querySelector('#raise-bet-value');
    const quickBets = document.querySelectorAll('.quick-bet');
    const exitIconSingle = document.querySelector('#exitIconSingle');
    const exitIcon = document.querySelector('#exitIcon');
    const exitModal = document.querySelector('#exitModal');
    const cancelButton = exitModal.querySelector('.cancel');
    const confirmExitBtn = exitModal.querySelector('#confirmExit');
    const chipsContainer = document.querySelector('.chips-container');

    const gameData = window.gameData;
    const playerNick = gameData.nick;
    let isStarted = window.isStarted;
    let playersBySeats = gameData.playersBySeats;
    let playersStates = gameData.playersStates;
    let currentBetValue = gameData.currentBet;
    let pot = gameData.pot;
    let activePlayerSeat = gameData.currentTurnSeat;
    let boardDeck = gameData.boardDeck;
    let actionBySeat = null;
    let currentPlayerBetValue = null;
    let currentPlayerCredits = null;
    let tempCards = null;

    const drawPlayers = () => {
        let playerIndex = playersBySeats.indexOf(playerNick);
        const players = playersBySeats.slice(playerIndex).concat(playersBySeats.slice(0, playerIndex));

        positionPlayers(players, playersStates);
    }

    const setBoardCards = () => {
        cardsContainer.innerHTML = '';

        for (let card of boardDeck) {
            const cardElement = createCardElement(card);
            cardsContainer.appendChild(cardElement);
            cardElement.style.opacity = '1';
        }
    }

    const updateInfo = () => {
        potValueElement.textContent = pot;

        const players = document.querySelectorAll('.player-js');
        const activePlayerNick = playersBySeats[activePlayerSeat - 1];
        const activePlayer = document.querySelector(`#player-${activePlayerNick}`);

        players.forEach(player => {
            player.classList.remove('active');
        });

        activePlayer.classList.add('active');
    }

    const updateView = () => {
        drawPlayers();
        setBoardCards();
        initialize();
        updateInfo();
        showActionPanel();

        if(isStarted) {
            waitingPopup.style.display = 'none';
        } else {
            waitingPopup.style.display = 'flex';
        }

        window.addEventListener('resize', () => {
            updateView();
        });
    }

    const showPlayerBet = (actionSeat, betValue) => {
        const playerNick = playersBySeats[actionBySeat - 1];
        const playerId = `player-${playerNick}`;
        const currentPlayer = document.querySelector(`#${playerId}`);
        const currentBet = currentPlayer.querySelector('.bet-value');
        const currentCredits = currentPlayer.querySelector('.balance-value');

        currentBet.textContent = currentPlayerBetValue;
        currentCredits.textContent = currentPlayerCredits;

        pushChipFromPlayer(currentPlayer, betValue);
    }

    const showActionPanel = () => {
        if (playersBySeats[activePlayerSeat - 1] === playerNick) {
            actionPanel.classList.add('visible');
        } else {
            actionPanel.classList.remove('visible');
        }
    }

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

    foldBtn.addEventListener('click', () => {
        // const playerIndex = 0;
        // foldPlayerCards(playerIndex);
        socket.emit('fold');
    });

    checkBtn.addEventListener('click', () => {
        socket.emit('call');
    });

    exitIconSingle.addEventListener('click', () => {
        socket.emit('leave');
    });

    confirmExitBtn.addEventListener('click', () => {
       socket.emit('leave');
    });

    exitIcon.addEventListener('click', () => {
        exitModal.style.display = 'flex';
    });

    cancelButton.addEventListener('click', () => {
        exitModal.style.display = "none";
    });

    if (isStarted) {
        updateView();
    } else {
        waitingPopup.style.display = 'flex'
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            socket.emit('start-game');
        });
    }

    socket.emit('change-players');

    socket.on('players-changed', (data) => {
        numOfPlayersElement.innerHTML = data.numOfPlayers;
    })

    socket.on('start-status', (data) => {
        startStatus.textContent = data.message;
    })

    socket.on('game-started', (data) => {
        boardDeck = [];
        playersBySeats = data.players;
        playersStates = data.playersStates;
        currentBetValue = data.betValue;
        currentPlayerBetValue = data.betValue;
        currentPlayerCredits = data.creditsLeft;
        activePlayerSeat = data.currentTurnSeat;
        actionBySeat = data.actionBySeat;
        pot = data.pot;
        isStarted = true;
        const betDiff = data.betDiff;

        chipsContainer.innerHTML = '';
        cardsContainer.innerHTML = '';

        updateView();
        showPlayerBet(actionBySeat, betDiff);

        if (waitingPopup) {
            waitingPopup.style.display = 'none';
        }
    });

    socket.on('raised', (data) => {
        actionBySeat = data.ActionBySeat;
        activePlayerSeat = data.currentTurnSeat;
        currentBetValue = data.betValue;
        currentPlayerBetValue = data.betValue;
        currentPlayerCredits = data.creditsLeft;
        const betDiff = data.betDiff;
        pot = data.pot;

        showPlayerBet(actionBySeat, betDiff);
        updateInfo();
        showActionPanel();
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

        showActionPanel();
    });

    socket.on('new-turn', (data) => {
        tempCards = data.cards;
        boardDeck.push(...tempCards);

        for (let i = 0; i < tempCards.length; i++) {
            dealCard(tempCards[i], i * 1000);
        }
    });

    socket.on('game-ended', (data) => {
        playersStates = data.playersStates;
        pot = data.pot;
        activePlayerSeat = data.currentTurnSeat;
        isStarted = false;

        updateView();
    });

    socket.on('leaved', () => {
        window.location.replace('/poker');
    })
});