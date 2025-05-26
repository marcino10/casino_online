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

export function dealCard(card) {
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
    }, 0);

    cardWrapper.addEventListener('transitionend', (e) => {
        if (e.propertyName !== 'transform') return;

        cardInner.classList.add('flipped');

        setTimeout(() => {
          cardWrapper.remove();
          targetImage.style.opacity = '1';
        }, 600);
    }, { once: true });
}

export function betChip(playerElement, potElement, amount) {
    const chip = document.createElement('div');
    chip.classList.add('chip');
    chip.textContent = amount;

    const playerRect = playerElement.getBoundingClientRect();
    const potRect = potElement.getBoundingClientRect();

    chip.style.left = `${playerRect.left}px`;
    chip.style.top = `${playerRect.top}px`;

    chip.classList.add('betting');
    setTimeout(() => {
        chip.style.left = `${potRect.left}px`;
        chip.style.top = `${potRect.top}px`;
    }, 50);

    document.body.appendChild(chip);
}
