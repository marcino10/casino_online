import { switchForm, showMessage } from './ui.js';
import { rules } from './validation.js';

document.addEventListener("DOMContentLoaded", () => {
    const logInBtn = document.querySelector(".login_button");
    const registerBtn = document.querySelector(".register_button");
    const registerForm = document.querySelector(".register_form");
    const inputs = registerForm.querySelectorAll(".form_input");

    logInBtn.onclick = () => switchForm("login");
    registerBtn.onclick = () => switchForm("register");

    const msg = document.querySelector(".server-msg");
    if (msg && msg.textContent.trim()) {
        showMessage(msg.textContent, msg.classList.contains("error") ? "error" : "success");
    }

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            const { name, value } = input;
            const rule = rules[name];
            const wrapper = input.closest(".input-wrapper");
            const errorEl = wrapper?.querySelector(".input-error");

            if (!rule || !errorEl) return;

            if (!rule.validate(value.trim())) {
                input.classList.add("invalid");
                errorEl.textContent = rule.message;
                errorEl.classList.add("visible");
            } else {
                input.classList.remove("invalid");
                errorEl.textContent = "";
                errorEl.classList.remove("visible");
            }
        });
    });

    registerForm.addEventListener("submit", e => {
        let hasError = false;

        inputs.forEach(input => {
            const { name, value } = input;
            const rule = rules[name];
            const wrapper = input.closest(".input-wrapper");
            const errorEl = wrapper?.querySelector(".input-error");

            if (!rule || !errorEl) return;

            if (!rule.validate(value.trim())) {
                input.classList.add("invalid");
                errorEl.textContent = rule.message;
                errorEl.classList.add("visible");
                hasError = true;
                setTimeout(() => input.classList.remove("invalid"), 600);
            } else {
                input.classList.remove("invalid");
                errorEl.textContent = "";
                errorEl.classList.remove("visible");
            }
        });

        // const termsAccepted = registerForm.querySelector("input[type='checkbox']").checked;
        // if (!termsAccepted) {
        //     showMessage("You must agree to the Terms and Services.", "error");
        //     hasError = true;
        // }

        if (hasError) {
            e.preventDefault();
        }
    });
});
