export function dealCard(sourceElement, targetImage, delay = 0) {
  const cardClone = document.createElement('div');
  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = targetImage.getBoundingClientRect();

  cardClone.classList.add('animated-card-matrix3d');
  cardClone.style.left = `${sourceRect.left}px`;
  cardClone.style.top = `${sourceRect.top}px`;
  cardClone.style.width = `${sourceRect.width}px`;
  cardClone.style.height = `${sourceRect.height}px`;
  cardClone.style.backgroundImage = `url(${sourceElement.src})`;

  document.body.appendChild(cardClone);

  setTimeout(() => {
    cardClone.style.transform = `matrix3d(
      0.95, 0.2, 0.1, 0,
     -0.2, 0.95, 0.1, 0,
      0.1, 0.0, 1,   0,
      ${targetRect.left - sourceRect.left}, 
      ${targetRect.top - sourceRect.top}, 
      120, 1
    )`;
  }, delay);

  cardClone.addEventListener('transitionend', () => {
    cardClone.remove();
    targetImage.style.opacity = '1';
  });
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
