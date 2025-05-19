import { deck, formatCardFilename } from './deckCore.js';

let currentStage = 0;

function devLog(msg) {
    const logBox = document.getElementById('dev-log');
    const p = document.createElement('p');
    p.textContent = `[LOG] ${msg}`;
    logBox.appendChild(p);
    logBox.scrollTop = logBox.scrollHeight;
}

function dealHand() {
    const hand = document.querySelector('.player-hand');
    hand.innerHTML = '';
    const card1 = deck.pop();
    const card2 = deck.pop();
    [card1, card2].forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'player-card';
        cardDiv.innerHTML = `
          <img class="card hand-card front" src="/img/deck/${formatCardFilename(card)}" />
          <img class="card hand-card back" src="/img/deck/back_red.webp" />
        `;
        hand.appendChild(cardDiv);
    });
    devLog("Hand dealt to player (via dev panel).");
}

function revealStage(stage) {
    const board = document.querySelector('.board');
    if (currentStage !== stage) return;

    let count = stage === 0 ? 3 : 1;
    for (let i = 0; i < count; i++) {
        const card = deck.pop();
        const img = document.createElement('img');
        img.className = 'card';
        img.src = `/img/deck/${formatCardFilename(card)}`;
        img.alt = card;
        board.appendChild(img);
    }

    devLog(`Revealed ${["Flop", "Turn", "River"][stage]}`);
    currentStage++;
}

function resetBoard() {
    const board = document.querySelector('.board');
    board.innerHTML = '';
    currentStage = 0;
    devLog("Board reset.");
}

let currentPot = 0;

function setPot() {
    const potValue = parseInt(document.getElementById('potInput').value, 10);
    if (isNaN(potValue)) {
        devLog("Invalid pot value.");
        return;
    }

    currentPot = potValue;
    document.getElementById('potDisplay').textContent = `Pot: $${currentPot}`;
    devLog(`Pot set to $${currentPot}`);
}


// Event Listeners
document.getElementById('dev-deal').addEventListener('click', dealHand);
document.getElementById('dev-flop').addEventListener('click', () => revealStage(0));
document.getElementById('dev-turn').addEventListener('click', () => revealStage(1));
document.getElementById('dev-river').addEventListener('click', () => revealStage(2));
document.getElementById('dev-reset').addEventListener('click', resetBoard);
document.getElementById('dev-set-pot').addEventListener('click', setPot);
document.getElementById('dev-ai-toggle').addEventListener('change', (e) => {
    devLog(`AI is now ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
});
