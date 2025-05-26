import {dealCard} from "./animations.js";
document.addEventListener('DOMContentLoaded', () => {
    const turnButton = document.getElementById('dev-turn');
    const card = {
        suit: 'heart',
        value: 'a'
    };

    turnButton.addEventListener('click', () => {
        dealCard(card);
    });
});

