const container = document.getElementById('playersContainer');

function createPlayerElement(playerNick, x, y) {
    const el = document.createElement('div');
    el.className = 'player';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.setAttribute('id', `player-${playerNick}`);

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
        <div class="name">${playerNick}</div>
        <p class="player-credits"></p>
        <p class="player-bet"></p>
    `;

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

export function positionPlayers(players) {
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
        container.appendChild(el);
    }
}
