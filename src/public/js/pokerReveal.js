
document.querySelectorAll('.card-container').forEach(card => {
    const front = card.querySelector('.card.front');
    const timerCircle = card.querySelector('.hold-timer circle:nth-child(2)');
    let interval, progress = 0;

    const startHold = () => {
        progress = 0;
        interval = setInterval(() => {
            progress += 1;
            const offset = 283 - (283 * progress / 100);
            timerCircle.style.strokeDashoffset = offset;
            if (progress >= 100) {
                clearInterval(interval);
                card.classList.add('reveal');
            }
        }, 15);
    };

    const cancelHold = () => {
        clearInterval(interval);
        timerCircle.style.strokeDashoffset = 283;
        if (!card.classList.contains('reveal')) {
            card.classList.remove('reveal');
        }
    };

    card.addEventListener('mousedown', startHold);
    card.addEventListener('mouseup', cancelHold);
    card.addEventListener('mouseleave', cancelHold);
    card.addEventListener('touchstart', startHold);
    card.addEventListener('touchend', cancelHold);
});




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

function positionPlayers(players) {
    container.innerHTML = '';

    const radius = window.innerWidth < 768 ? 120 : 180;
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;

    players.forEach((player, index) => {
        const angle = ((index +  1) / (players.length + 1)) * Math.PI * 2;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const el = document.createElement('div');
        el.className = 'player';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.innerHTML = `
      <div class="avatar"></div>
      <div class="name">${player.name}</div>
    `;

        container.appendChild(el);
    });
}

window.addEventListener('resize', () => positionPlayers(players));
positionPlayers(players);
