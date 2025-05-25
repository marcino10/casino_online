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