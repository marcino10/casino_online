const players = [
    { name: 'Alice', bet: 120, balance: 1380 },
    { name: 'Bob', bet: 50, balance: 600 },
    { name: 'Charlie', bet: 0, balance: 1000 },
    { name: 'Dana', bet: 30, balance: 900 },
    { name: 'Eli', bet: 75, balance: 1120 },
    { name: 'Frank', bet: 0, balance: 500 },
    { name: 'Gina', bet: 45, balance: 860 },
];

const container = document.getElementById('playersContainer');


function createPlayerElement(player, x, y) {
    const el = document.createElement('div');
    el.className = 'player';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    const hand = document.createElement('div');
    hand.className = 'player-hand';

    for (let i = 0; i < 2; i++) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'player-card';
        cardDiv.innerHTML = `
            <img class="card hand-card front" src="/img/deck/back_red.webp" alt="Card" />
            <img class="card hand-card back" src="/img/deck/back_red.webp" alt="Card" />
        `;
        hand.appendChild(cardDiv);
    }

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = player.name;

    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `
            <span class="bet">bet: $${player.bet}</span>
            <span class="balance">Balance: $${player.balance}</span>
        `;

    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-container';
    avatarContainer.innerHTML = `
        <div class="avatar"></div>
        <button class="reveal-cards" title="Reveal cards">👁</button>
    `;

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'player-cards';
    cardsContainer.appendChild(hand);


    el.appendChild(name);
    el.appendChild(info);
    el.appendChild(avatarContainer);
    el.appendChild(cardsContainer);

    // Add click handler for the reveal button
    setTimeout(() => {
        const revealBtn = el.querySelector('.reveal-cards');
        const playerCards = el.querySelectorAll('.player-card');
        let cardsRevealed = false;

        revealBtn.addEventListener('click', () => {
            cardsRevealed = !cardsRevealed;
            playerCards.forEach(card => {
                card.classList.toggle('revealed', cardsRevealed);
            });
            revealBtn.classList.toggle('active', cardsRevealed);
        });
    }, 0);

    return el;
}

export function positionPlayers() {
    container.innerHTML = '';

    const radius = window.innerWidth < 769 ? window.innerHeight * 0.2 : window.innerHeight * 0.35;
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;

    for (let i = 0; i <= players.length; i++) {
        if (i === 0) continue;

        const player = players[i-1];
        const angle = (((i) / (players.length + 1)) * Math.PI * 2) + 0.5 * Math.PI;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const el = createPlayerElement(player, x, y);
        el.dataset.playerIndex = i - 1;
        container.appendChild(el);
    }
}

function getChipVariant(betAmount) {
    const minBet = 100;
    const maxBet = 1000;
    const percentage = (betAmount / maxBet) * 100;

    if (percentage >= 90) return 'chip--gold';
    if (percentage >= 70) return 'chip--black';
    if (percentage >= 50) return 'chip--blue';
    if (percentage >= 25) return 'chip--green';
    return 'chip--red';
}

export function pushChipFromPlayer(playerIndex, mainPlayerElement = null, betAmount = 100) {
    const table = document.querySelector('.table');
    const chipsContainer = document.querySelector('.chips-container');
    let sourceElement;

    if (playerIndex === -1 && mainPlayerElement) {
        sourceElement = mainPlayerElement;
    } else {
        const players = document.querySelectorAll('.player');
        sourceElement = players[playerIndex];
    }

    if (!sourceElement || !table || !chipsContainer) return;

    const chip = document.createElement('div');
    chip.classList.add('chip');
    chip.classList.add(getChipVariant(betAmount));

    const chipValue = document.createElement('div');
    chipValue.classList.add('chip-value');
    chipValue.textContent = betAmount;
    chip.appendChild(chipValue);

    const chipLogo = document.createElement('img');
    chipLogo.src = '/img/BIG_WIN.svg';
    chipLogo.alt = 'Chip Logo';
    chipLogo.classList.add('chip-logo');
    chip.appendChild(chipLogo);

    const sourceRect = sourceElement.getBoundingClientRect();
    const containerRect = chipsContainer.getBoundingClientRect();

    const startX = sourceRect.left - containerRect.left + (sourceRect.width);
    const startY = sourceRect.top - containerRect.top + (sourceRect.height);

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
