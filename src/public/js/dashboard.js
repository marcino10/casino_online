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

  const passwordValidation = () => {
    const val = newPasswordInput.value;
    if (!isValidPassword(val)) {
      showError(newPasswordInput, 'Password must be 5+ characters and contain a number');
      return false;
    } else {
      clearError(newPasswordInput);
    }

    if (!isSamePassword(val, repeatPasswordInput.value)) {
      showError(repeatPasswordInput, 'Passwords do not match.');
      return false;
    } else {
        clearError(repeatPasswordInput);
    }

    return true;
  }


  newPasswordInput.addEventListener('input', () => {
    passwordValidation();
  });

  repeatPasswordInput.addEventListener('input', () => {
    passwordValidation()
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordValidation()) {
      form.submit();
    }
  });

});
