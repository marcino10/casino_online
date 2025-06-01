let buttons = document.querySelectorAll('.button_game')
let count = 0
buttons.forEach(btn => {
    count++
    let lastBtn = buttons[buttons.length - 1]
    if (count % 2 === 1){
        lastBtn.style.gridColumn = "span 2"
    }else{
        lastBtn.style.gridColumn = "span 1"
    }
})
console.log("Total buttons:", count)

const toggleButton = document.getElementById("toggle-btn")
const sidebar = document.getElementById("sidebar")

function toggleSidebar() {
    sidebar.classList.toggle("close")
    toggleButton.classList.toggle("rotate")

    closeAllSubMenus()
}

function toggleSubMenu(button) {
    if (!button.nextElementSibling.classList.contains("show")) {
        closeAllSubMenus()
    }

    button.nextElementSibling.classList.toggle("show")
    button.classList.toggle("rotate")

    if (sidebar.classList.contains("close")) {
        sidebar.classList.toggle("close")
        toggleButton.classList.toggle("rotate")
    }
}

function closeAllSubMenus() {
    Array.from(sidebar.getElementsByClassName("show")).forEach((ul) => {
        ul.classList.remove("show")
        ul.previousElementSibling.classList.remove("rotate")
    })
}