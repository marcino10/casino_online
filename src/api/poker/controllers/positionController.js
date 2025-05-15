const pokerService = require('../services/pokerService')

const expressAsyncHandler = require("express-async-handler");

exports.getPositions = expressAsyncHandler ( async (req, res, next)  => {
    const json = req.body;
    const boardDeck = json["0"];
    let players = json;
    delete players["0"];

    const respond = pokerService.getPlayersPositionsAndBestHands(players, boardDeck);

    return res.json(respond);
});