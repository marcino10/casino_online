export function switchForm(type) {
    const loginForm = document.querySelector(".login_form");
    const registerForm = document.querySelector(".register_form");
    const btnHighlightEl = document.querySelector(".buttons-highlight");

    if (type === "login") {
        loginForm.style.transform = "translateX(0%)";
        registerForm.style.transform = "translateX(100%)";
        btnHighlightEl.style.left = "0";
    } else {
        loginForm.style.transform = "translateX(100%)";
        registerForm.style.transform = "translateX(0%)";
        btnHighlightEl.style.left = "110px";
    }
}

export function showMessage(message, type = "error") {
    const msgEl = document.querySelector(".server-msg");
    msgEl.textContent = message;
    msgEl.className = `server-msg ${type}`;
    msgEl.style.display = "block";
    msgEl.style.opacity = "0";
    msgEl.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    msgEl.style.transform = "translateY(-10px)";

    setTimeout(() => {
        msgEl.style.opacity = "1";
        msgEl.style.transform = "translateY(0)";
    }, 100);

    setTimeout(() => {
        msgEl.style.opacity = "0";
        msgEl.style.transform = "translateY(-10px)";
        setTimeout(() => {
            msgEl.style.display = "none";
            msgEl.textContent = "";
        }, 500);
    }, 5000);
}
