export function initialize() {
    // popup initialization
    const popup = document.querySelector('.pop-up');
    const helpIcon = document.querySelector('#helpIcon');
    const closePopup = document.querySelector('.close-popup');
    const exitIcon = document.querySelector('#exitIcon');
    const exitModal = document.querySelector('#exitModal');
    const cancelButton = exitModal.querySelector('.cancel');

    helpIcon.addEventListener('click', () => {
        popup.classList.add('visible');
    });

    closePopup.addEventListener('click', () => {
        popup.classList.remove('visible');
    });

    // exit button
    exitIcon.addEventListener("click", () => {
        exitModal.style.display = "flex";
    });

    cancelButton.addEventListener("click", () => {
        exitModal.style.display = "none";
    });

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('visible');
        }
    });
}