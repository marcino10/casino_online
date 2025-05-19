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

        const el = document.createElement('div');
        el.className = 'player';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.innerHTML = `
      <div class="avatar"></div>
      <div class="name">${player.name}</div>
    `;

        container.appendChild(el);
    }
}
