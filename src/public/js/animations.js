export function dealCard(sourceElement, targetElement, delay = 0) {
    const card = document.createElement('div');
    card.classList.add('card');

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    card.style.left = `${sourceRect.left}px`;
    card.style.top = `${sourceRect.top}px`;

    setTimeout(() => {
        card.classList.add('dealing');
        card.style.left = `${targetRect.left}px`;
        card.style.top = `${targetRect.top}px`;

        card.addEventListener('transitionend', () => {
            targetElement.appendChild(card);
        });
    }, delay);

    document.body.appendChild(card);
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