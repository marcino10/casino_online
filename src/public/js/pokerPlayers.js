const players = [
    { name: 'Alice' },
    { name: 'Bob' },
    { name: 'Charlie' },
    { name: 'Dana' },
    { name: 'Eli' },
    { name: 'Frank' },
    { name: 'Gina' },
    { name: 'Harry' },
    { name: 'Ivy' }
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

    el.innerHTML = `
        <div class="player-cards">
            ${hand.outerHTML}
        </div>
        <div class="avatar-container">
            <div class="avatar"></div>
            <button class="reveal-cards" title="Reveal cards">👁</button>
        </div>
        <div class="name">${player.name}</div>
    `;



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


export function pushChipFromPlayer(playerIndex) {
    const table = document.querySelector('.table');
    const players = document.querySelectorAll('.player');
    const chipsContainer = document.querySelector('.chips-container');
    const player = players[playerIndex];

    if (!player || !table || !chipsContainer) return;

    const chip = document.createElement('div');
    chip.classList.add('chip');
    chip.classList.add('chip--red');


    const chipValue = document.createElement('div');
    chipValue.classList.add('chip-value');
    chipValue.textContent = '100';
    chip.appendChild(chipValue);


    const chipLogo = document.createElement('img');
    chipLogo.src = '/img/BIG_WIN.svg';
    chipLogo.alt = 'Chip Logo';
    chipLogo.classList.add('chip-logo');
    chip.appendChild(chipLogo);


    const playerRect = player.getBoundingClientRect();
    const containerRect = chipsContainer.getBoundingClientRect();


    const startX = playerRect.left - containerRect.left + (playerRect.width / 2);
    const startY = playerRect.top - containerRect.top + (playerRect.height / 2);


    const randomOffsetX = Math.random() * 300;
    const randomOffsetY = Math.random()  * 150;


    chip.style.transform = `translate(${startX - containerRect.width/2}px, ${startY - containerRect.height/2}px)`;
    chipsContainer.appendChild(chip);

    chip.offsetHeight;


    requestAnimationFrame(() => {
        chip.style.transform = `translate(${randomOffsetX}%, ${randomOffsetY}%)`;
        chip.style.opacity = '1';
    });
}
