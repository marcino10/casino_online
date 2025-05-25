import { pushChipFromPlayer } from "./pokerPlayers.js";

export function initialize() {
    const mainPlayerHand = document.querySelector('.player--main .player-hand');
    const mainPlayerCards = document.querySelectorAll('.player--main .player-card');
    let mainCardsRevealed = false;

    if (mainPlayerHand) {
        mainPlayerHand.addEventListener('click', (e) => {
            if (e.target.closest('.player-card')) {
                mainCardsRevealed = !mainCardsRevealed;
                mainPlayerCards.forEach(card => {
                    card.classList.toggle('revealed', mainCardsRevealed);
                });
            }
        });
    }

    const actionPanel = document.querySelector('.action-panel');
    const raisePanel = document.querySelector('.raise-panel');
    const raiseButton = document.querySelector('.raise');
    const confirmRaiseButton = document.querySelector('.confirm-raise');
    const cancelRaiseButton = document.querySelector('.cancel-raise');
    const betSlider = document.querySelector('.bet-slider');
    const betValue = document.querySelector('.bet-value');
    const quickBets = document.querySelectorAll('.quick-bet');

    // Initialize the action panel as visible
    setTimeout(() => {
        actionPanel.classList.add('visible');
    }, 100);

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

    confirmRaiseButton.addEventListener('click', () => {
        const betAmount = parseInt(betSlider.value);

        pushChipFromPlayer(0, betAmount);

        raisePanel.classList.remove('visible');
        setTimeout(() => {
            actionPanel.classList.add('visible');
        }, 300);
    });

    cancelRaiseButton.addEventListener('click', () => {
        raisePanel.classList.remove('visible');
        setTimeout(() => {
            actionPanel.classList.add('visible');
        }, 300);
    });

    // popup initialization
    const popup = document.querySelector(".pop-up");
    const helpIcon = document.querySelector("#helpIcon");
    const closeBtn = document.querySelector(".close_pop-up");

    helpIcon?.addEventListener("click", () => {
        popup?.classList.toggle("visible");
    });

    closeBtn?.addEventListener("click", () => {
        popup?.classList.remove("visible");
    });
}