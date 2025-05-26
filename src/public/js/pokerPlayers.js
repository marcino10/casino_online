const container = document.getElementById('playersContainer');

export const setCards = (playerElement, playerHand) => {
    if (playerHand.length === 0) return;

    const deckUrl = '/img/deck'
    if(playerHand.length > 0) {
        const cards = playerElement.querySelectorAll('.front');
        for (let i = 0; i < cards.length; i++) {
            const card = playerHand[i];
            const suit = card.suit;
            const value = card.value;
            cards[i].setAttribute('src', `${deckUrl}/${suit}_${value}_mobile.svg`);
        }
    }
}

const cardsReveal = (e, playerElement) => {
    const playerCards = playerElement.querySelectorAll('.player-card');

    if (e.target.closest('.player-card')) {
        playerCards.forEach(card => {
            card.classList.toggle('revealed');
        });
    }
}

const setEventListenerForCardsReveal = (playerElement) => {
    const playerHand = playerElement.querySelector('.player-hand');

    if (playerHand) {
        playerHand.addEventListener('click', (e) => {
            cardsReveal(e, playerElement);
        });
    }
}

export const deleteEventListenerForCardsReveal = (playerElement) => {
    const newPLayerElement = playerElement.cloneNode(true);
    const cards = newPLayerElement.querySelectorAll('.player-card');

    cards.forEach(card => {
        card.classList.add('revealed');
    });

    playerElement.replaceWith(newPLayerElement);
}

function createPlayerElement(player, x, y, isMainPlayer) {
    const playerElement = document.querySelector('#player-template').cloneNode(true);

    if(isMainPlayer) {
        playerElement.classList.add('player--main');
    }

    setCards(playerElement, player.hand);

    console.log(player)
    if ((!isMainPlayer && player.hand.length > 0) || (isMainPlayer && player.isFolded)) {
        const playerCards = playerElement.querySelectorAll('.player-card');
        playerCards.forEach(card => {
            card.classList.add('revealed');
        })
    } else if(isMainPlayer) {
        setEventListenerForCardsReveal(playerElement);
    }

    playerElement.style.left = `${x}px`;
    playerElement.style.top = `${y}px`;
    playerElement.setAttribute('id', `player-${player.nick}`);
    playerElement.classList.add('player-js')

    const playerName = playerElement.querySelector('.name');
    const betValue = playerElement.querySelector('.bet-value');
    const balanceValue = playerElement.querySelector('.balance-value');

    playerName.textContent = player.nick;
    betValue.textContent = player.bet;
    balanceValue.textContent = player.balance;

    return playerElement;
}

export function positionPlayers(players, playersStates) {
    container.innerHTML = '';

    const radius = window.innerWidth < 769 ? window.innerHeight * 0.2 : window.innerHeight * 0.35;
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;

    let isMainPlayer;
    for (let i = 0; i < players.length; i++) {
        isMainPlayer = (i === 0);

        const playerNick = players[i];
        const playerState = playersStates[playerNick];
        const player = {
            nick: playerNick,
            bet: playerState.lastBet,
            balance: playerState.creditsLeft,
            hand: playerState.hand,
            isFolded: playerState.isFolded
        }

        const angle = ((i / players.length) * Math.PI * 2) + 0.5 * Math.PI;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const playerElement = createPlayerElement(player, x, y, isMainPlayer);
        playerElement.dataset.playerIndex = i;
        container.appendChild(playerElement);
    }
}

function getChipVariant(betAmount) {
    const maxBet = 1000;
    const percentage = (betAmount / maxBet) * 100;

    if (percentage >= 90) return 'chip--gold';
    if (percentage >= 70) return 'chip--black';
    if (percentage >= 50) return 'chip--blue';
    if (percentage >= 25) return 'chip--green';
    return 'chip--red';
}

export function pushChipFromPlayer(playerIndex, betAmount = 100) {
    const chipsContainer = document.querySelector('.chips-container');
    let sourceElement;

    const players = document.querySelectorAll('.player-js');
    sourceElement = players[playerIndex];

    if (!sourceElement || !chipsContainer) return;

    const chip = document.querySelector('#chip-template').cloneNode(true);
    chip.setAttribute('id', '');
    chip.classList.add('chip-js')
    chip.classList.add(getChipVariant(betAmount));

    const chipValue = chip.querySelector('.chip-value');
    chipValue.textContent = betAmount;

    const sourceRect = sourceElement.getBoundingClientRect();
    const containerRect = chipsContainer.getBoundingClientRect();

    const startX = sourceRect.left - containerRect.left + (sourceRect.width);
    const startY = sourceRect.top - containerRect.top + (sourceRect.height / 2);

    const randomOffsetX = Math.random() * 300;
    const randomOffsetY = Math.random() * 150;

    chip.style.opacity = '0.5';
    chip.style.transform = `translate(${startX - containerRect.width / 2}px, ${startY - containerRect.height / 2}px)`;
    chip.style.transform += ` rotate(${Math.random() * 360}deg)`;
    chipsContainer.appendChild(chip);

    requestAnimationFrame(() => {
        chip.style.transform = `translate(${randomOffsetX}%, ${randomOffsetY}%)`;
        chip.style.opacity = '1';
    });
}
