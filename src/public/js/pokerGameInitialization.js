export function initialize() {
    // popup initialization
    const popup = document.querySelector('.pop-up');
    const helpIcon = document.querySelector('#helpIcon');
    const closePopup = document.querySelector('.close-popup');

    helpIcon.addEventListener('click', () => {
        popup.classList.add('visible');
    });

    closePopup.addEventListener('click', () => {
        popup.classList.remove('visible');
    });

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('visible');
        }
    });
}