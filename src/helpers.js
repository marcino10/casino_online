// flash helper
function setFlash(req, type, message) {
    if (!req.session.flash) req.session.flash = {};
    if (!req.session.flash[type]) req.session.flash[type] = [];
    req.session.flash[type].push(message);
}

module.exports = {
    setFlash
}