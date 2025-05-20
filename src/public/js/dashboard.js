import {
  isValidPassword,
  isSamePassword
} from './validation.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.change_password .form');
  const inputs = form.querySelectorAll('.password');
  const newPasswordInput = inputs[1];
  const repeatPasswordInput = inputs[2];

  const showError = (input, message) => {
    input.classList.add('invalid');
    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains('input-error')) {
      errorEl = document.createElement('div');
      errorEl.className = 'input-error visible';
      input.after(errorEl);
    }
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  };

  const clearError = (input) => {
    input.classList.remove('invalid');
    const errorEl = input.nextElementSibling;
    if (errorEl && errorEl.classList.contains('input-error')) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  };

  newPasswordInput.addEventListener('input', () => {
    const val = newPasswordInput.value;
    if (!isValidPassword(val)) {
      showError(newPasswordInput, 'Password must be 5+ characters and contain a number');
    } else {
      clearError(newPasswordInput);
    }

    if (!isSamePassword(val, repeatPasswordInput.value)) {
      showError(repeatPasswordInput, 'Passwords do not match.');
    } else {
      clearError(repeatPasswordInput);
    }
  });

  repeatPasswordInput.addEventListener('input', () => {
    const val = repeatPasswordInput.value;
    if (!isSamePassword(newPasswordInput.value, val)) {
      showError(repeatPasswordInput, 'Passwords do not match.');
    } else {
      clearError(repeatPasswordInput);
    }
  });

});
