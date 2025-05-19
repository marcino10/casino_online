import {positionPlayers} from "./pokerPlayers.js";
import {} from "./devPanel.js";
import {} from "./deckManager.js";

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

window.addEventListener('resize', positionPlayers);
positionPlayers();

const board = document.querySelector('.board');
const hand = document.querySelector('.player-hand');

