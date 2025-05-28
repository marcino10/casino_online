import { createCardElement} from "./pokerGame.js";

const createCardWrapperForAnimation = (sourceElement, targetImage) => {
    const sourceRect = sourceElement.getBoundingClientRect();

    const cardWrapper = document.createElement('div');
    cardWrapper.classList.add('card-flip-wrapper');
    cardWrapper.style.left = `${sourceRect.left}px`;
    cardWrapper.style.top = `${sourceRect.top}px`;
    cardWrapper.style.width = `${sourceRect.width}px`;
    cardWrapper.style.height = `${sourceRect.height}px`;

    return cardWrapper;
}

const createCardInnerForAnimation = (sourceElement, targetImage) => {
    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-face', 'back');
    cardBack.style.backgroundImage = `url(${sourceElement.src})`;

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-face', 'front');
    cardFront.style.backgroundImage = `url(${targetImage.src})`;

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);

    return cardInner;
}

export function dealCard(card, delay = 100) {
    if (delay < 100) {
        delay = 100;
    }

    const cardsContainer = document.querySelector('.cards-container');
    const sourceElement = document.querySelector('.deck img');

    const targetImage = createCardElement(card);
    cardsContainer.appendChild(targetImage);

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetImage.getBoundingClientRect();

    const cardWrapper = createCardWrapperForAnimation(sourceElement, targetImage);
    const cardInner = createCardInnerForAnimation(sourceElement, targetImage);

    cardWrapper.appendChild(cardInner);
    document.body.appendChild(cardWrapper);

    setTimeout(() => {
        const dx = targetRect.left - sourceRect.left;
        const dy = targetRect.top - sourceRect.top;
        cardWrapper.style.transform = `translate(${dx}px, ${dy}px)`;
    }, delay);

    cardWrapper.addEventListener('transitionend', (e) => {
        if (e.propertyName !== 'transform') return;

        cardInner.classList.add('flipped');

        setTimeout(() => {
          cardWrapper.remove();
          targetImage.style.opacity = '1';
        }, 600);
    }, { once: true });
}

// function dealToPlayers() {
//     const players = document.querySelectorAll('.player');
//     const deckImage = document.querySelector('.deck img');
//     let dealDelay = 0;
//
//     players.forEach((player) => {
//         const cards = player.querySelectorAll('.player-card');
//         cards.forEach((cardContainer) => {
//             const card = deck.pop();
//             if (card) {
//                 const frontCard = cardContainer.querySelector('.front');
//                 frontCard.src = `/img/deck/${formatCardFilename(card)}`;
//                 frontCard.style.opacity = '0';
//
//                 dealCard(deckImage, frontCard, dealDelay);
//                 dealDelay += 150;
//             }
//         });
//     });
//     renderDeckList();
// }

export function foldPlayerCards(playerIndex) {
    const players = document.querySelectorAll('.player-js');
    const player = players[playerIndex];
    if (!player) return;

    const cards = player.querySelectorAll('.player-card');

    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('folded');
        }, index * 150);
    });

    // setTimeout(() => {
    //     cards.forEach(card => {
    //         card.style.display = 'none';
    //     });
    // }, 600);
}