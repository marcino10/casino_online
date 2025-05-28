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

    const radius = window.innerWidth < 769 ? window.innerHeight * 0.32 : window.innerHeight * 0.35;
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

const CHIP_VALUES = [
    { value: 0,   class: 'chip--red' },
    { value: 0,   class: 'chip--green' },
    { value: 0,   class: 'chip--blue' },
    { value: 0,   class: 'chip--black' },
    { value: 0,   class: 'chip--gold' }
];


function normalizeChipValue(rawValue) {
    if (rawValue % 5 !== 0) {
        return Math.round(rawValue / 10) * 10;
    }
    return rawValue;
}

function setChipValue(minBet, maxBet) {
    const percentages = [0.05, 0.1, 0.25, 0.5, 1];

    CHIP_VALUES[0].value = minBet;

    for (let i = 1; i < CHIP_VALUES.length; i++) {
        const rawValue = Math.round(maxBet * percentages[i]);
        CHIP_VALUES[i].value = normalizeChipValue(rawValue);
    }
}

function getChipVariant(betAmount) {
    const sortedChips = CHIP_VALUES.slice().sort((a, b) => b.value - a.value);
    let amountLeft = betAmount;
    const chips = [];
    for (const chip of sortedChips) {
        if (chip.value <= 0) continue;
        const count = Math.floor(amountLeft / chip.value);
        for (let i = 0; i < count; i++) {
            chips.push({ class: chip.class, value: chip.value });
        }
        amountLeft -= count * chip.value;
    }
    return chips;
}

export function pushChipFromPlayer(playerIndex, betAmount = 100) {

    setChipValue(1, 50);

    const chipsContainer = document.querySelector('.chips-container');
    let sourceElement;

    const players = document.querySelectorAll('.player-js');
    sourceElement = players[playerIndex];

    if (!sourceElement || !chipsContainer) return;

    const chipVariants = getChipVariant(betAmount);

    const sourceRect = sourceElement.getBoundingClientRect();
    const containerRect = chipsContainer.getBoundingClientRect();

    const startX = sourceRect.left - containerRect.left + (sourceRect.width);
    const startY = sourceRect.top - containerRect.top + (sourceRect.height / 2);

    chipVariants.forEach((chipData, idx) => {
        const chip = document.querySelector('#chip-template').cloneNode(true);
        chip.setAttribute('id', '');
        chip.classList.add('chip-js');
        chip.classList.add(chipData.class);

        const chipValue = chip.querySelector('.chip-value');
        chipValue.textContent = chipData.value;


    const randomOffsetX = Math.random() * 60;
    const randomOffsetY = Math.random() * 60;

    chip.style.opacity = '0.5';
    chip.style.transform = `translate(${- 50}%, ${startY - containerRect.height*0.8}px)`;
    chip.style.transform += ` rotate(${Math.random() * 360}deg)`;
    chipsContainer.appendChild(chip);

    requestAnimationFrame(() => {
        switch (chipData.class){
            case 'chip--red':
                chip.style.transform = `translate(${-275-randomOffsetX}%, ${200-randomOffsetY}%)`;
                break;
            case 'chip--green':
                chip.style.transform = `translate(${-125-randomOffsetX}%, ${200-randomOffsetY}%)`;
                break;
            case 'chip--blue':
                chip.style.transform = `translate(${25-randomOffsetX}%, ${200-randomOffsetY}%)`;
                break;
            case 'chip--black':
                chip.style.transform = `translate(${175-randomOffsetX}%, ${200-randomOffsetY}%)`;
                break;
            case 'chip--gold':
                chip.style.transform = `translate(${325-randomOffsetX}%, ${200-randomOffsetY}%)`;
                break;
            default:
                chip.style.transform = `translate(${75-randomOffsetX}%, ${200-randomOffsetY}%)`;
                break;
        }
        chip.style.opacity = '1';
    });
    });
}
