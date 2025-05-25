import { deck, formatCardFilename } from './deckCore.js';
import {dealCard} from "./animations.js";

document.addEventListener('DOMContentLoaded', () => {
    const turnButton = document.getElementById('dev-turn');
    const board = document.querySelector('.cards-container');
    const deckImage = document.querySelector('.deck img');

    turnButton.addEventListener('click', () => {
        if (!deck.length) return;

        const card = deck.pop();
        const img = document.createElement('img');
        img.classList.add('card');
        img.src = `/img/deck/${formatCardFilename(card)}`;
        img.alt = card;
        img.style.opacity = '0';

        board.appendChild(img);
        dealCard(deckImage, img, 0);
    });
});

