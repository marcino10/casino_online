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

    // Re-join
    const rejoinGamePopup = document.getElementById('rejoinGamePopup');
    const closeRejoinPopup = document.getElementById('closeRejoinPopup');
    const rejoinLeaveBtn = document.getElementById('rejoinLeaveBtn');
    const rejoinConfirmBtn = document.getElementById('rejoinConfirmBtn');

    //Show the rejoin modal (for demo, remove in production)
    setTimeout(() => {
        if (rejoinGamePopup) rejoinGamePopup.classList.add('active');
    }, 1000);
    //remove this after testing

    if (closeRejoinPopup) {
        closeRejoinPopup.addEventListener('click', () => {
            rejoinGamePopup.classList.remove('active');
        });
    }
    if (rejoinLeaveBtn) {
        rejoinLeaveBtn.addEventListener('click', () => {
            // leave game logic here
            rejoinGamePopup.classList.remove('active');
        });
    }
    if (rejoinGamePopup) {
        rejoinGamePopup.addEventListener('click', (e) => {
            if (e.target === rejoinGamePopup) {
                // Close the popup if the user clicks outside of it
                rejoinGamePopup.classList.remove('active');
            }
        });
    }
    if (rejoinConfirmBtn) {
        rejoinConfirmBtn.addEventListener('click', () => {
            // rejoin game logic here
            rejoinGamePopup.classList.remove('active');
        });
    }
});
