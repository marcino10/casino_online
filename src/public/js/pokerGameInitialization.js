export function initialize() {
    // popup initialization
    const popup = document.querySelector(".pop-up");
    const helpIcon = document.querySelector("#helpIcon");
    const closeBtn = document.querySelector(".close_pop-up");

    helpIcon?.addEventListener("click", () => {
        popup?.classList.toggle("visible");
    });

    closeBtn?.addEventListener("click", () => {
        popup?.classList.remove("visible");
    });
}