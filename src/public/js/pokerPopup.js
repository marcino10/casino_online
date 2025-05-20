import { pokerRules } from './validation.js';
import { showMessage } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const createGameFab = document.getElementById('createGameFab');
    const createGamePopup = document.getElementById('createGamePopup');
    const closePopup = document.getElementById('closePopup');
    const form = createGamePopup.querySelector('form');
    const inputs = form.querySelectorAll('input[type="text"], input[type="number"]');

    inputs.forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const errorEl = document.createElement('small');
        errorEl.className = 'input-error';
        wrapper.appendChild(errorEl);

        input.addEventListener('input', () => {
            const { name, value } = input;
            const rule = pokerRules[name];

            if (!rule) return;

            if (!rule.validate(value.trim())) {
                input.classList.add('invalid');
                errorEl.textContent = rule.message;
                errorEl.classList.add('visible');
            } else {
                input.classList.remove('invalid');
                errorEl.textContent = '';
                errorEl.classList.remove('visible');
            }
        });
    });

    form.addEventListener('submit', (e) => {
        let hasError = false;

        inputs.forEach(input => {
            const { name, value } = input;
            const rule = pokerRules[name];
            const errorEl = input.parentNode.querySelector('.input-error');

            if (!rule || !errorEl) return;

            if (!rule.validate(value.trim())) {
                input.classList.add('invalid');
                errorEl.textContent = rule.message;
                errorEl.classList.add('visible');
                hasError = true;
                setTimeout(() => input.classList.remove('invalid'), 600);
            }
        });

        if (hasError) {
            e.preventDefault();
            showMessage("Please fix the errors before submitting", "error");
        }
    });

    createGameFab.addEventListener('click', () => {
        createGamePopup.classList.add('active');
    });

    closePopup.addEventListener('click', () => {
        createGamePopup.classList.remove('active');
    });

    createGamePopup.addEventListener('click', (e) => {
        if (e.target === createGamePopup) {
            createGamePopup.classList.remove('active');
        }
    });
});