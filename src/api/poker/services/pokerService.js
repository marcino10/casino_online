const handService = require('./pokerHandsService');

const getPlayersBestHands = (players, boardDeck) => {
    let playersRankings = {};

    for (let key in players) {
        if (players.hasOwnProperty(key)) {
            playersRankings[key] = handService.getPlayerBestHand(boardDeck, players[key]);
        }
    }

    return playersRankings
}

const getPlayersPositions = (playersRankings) => {
    let playersPositions = [];
    let rankingsToPlayers = {};

    for (let key in playersRankings) {
        if (playersRankings.hasOwnProperty(key)) {
            if (playersRankings.hasOwnProperty(key)) {
                const playerRanking = playersRankings[key];
                const rankingValue = playerRanking.rankingValue;

                if (!rankingsToPlayers.hasOwnProperty(rankingValue)) {
                    rankingsToPlayers[rankingValue] = [];
                }

                rankingsToPlayers[rankingValue].push(key);
            }
        }

    }

    for (let i = 9; i >= 1; i--) {
        if (rankingsToPlayers.hasOwnProperty(i)) {
            const players = rankingsToPlayers[i];

            let currentRankingPositions = [];
            for (let j = 0; j < players.length; j++) {
                const currentPlayer = players[j];
                const currentPlayerCards = playersRankings[currentPlayer].cardsInHighestRankingValues;

                if (j === 0) {
                    currentRankingPositions.push(currentPlayer);
                    continue;
                }

                outerLoop: for (let k = 0; k < currentRankingPositions.length; k++) {

                    const prevPlayer = currentRankingPositions[k];
                    const prevPlayerCards = playersRankings[prevPlayer].cardsInHighestRankingValues;

                    for (let l = 0; l < currentPlayerCards.length; l++) {
                        const currentPlayerCard = currentPlayerCards[l];
                        const prevPlayerCard = prevPlayerCards[l];

                        if (currentPlayerCard > prevPlayerCard) {
                            currentRankingPositions.splice(k, 0, currentPlayer);
                            break outerLoop;

                        } else if (currentPlayerCard < prevPlayerCard) {
                            if (k === currentRankingPositions.length - 1) {
                                currentRankingPositions.push(currentPlayer);
                                break outerLoop;
                            }

                            continue outerLoop;

                        } else {
                            if (l === currentPlayerCards.length - 1 && k === currentRankingPositions.length - 1) {
                                currentRankingPositions.push(currentPlayer);
                                break outerLoop;
                            }
                        }
                    }
                }

            }

            playersPositions.push(currentRankingPositions);
        }
    }

    return playersPositions;
}

const getPlayersPositionsAndBestHands = (players, boardDeck) => {
    const playersBestHands = getPlayersBestHands(players, boardDeck);
    const playersPositions = getPlayersPositions(playersBestHands);

    return {
        "playersPositions": playersPositions,
        "playersBestHands": playersBestHands
    }
}

module.exports = {
    getPlayersPositionsAndBestHands,
};