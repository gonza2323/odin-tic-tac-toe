"use strict";


function createPlayer(name) {
    function getName() {
        return name;
    }

    return { getName };
}


const board = (function() {
    const board = [];

    function reset() {
        for (let i = 0; i < 3; i++)
            board[i] = [null, null, null];
    }

    function get(x, y) {
        return board[y][x];
    }

    function set(x, y, player) {
        board[y][x] = player;
    }

    function isFull() {
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if (board[i][j] === null)
                    return false;
        return true;
    }

    reset();
    return { get, set, isFull, reset };
})();


function createGame(player1, player2) {
    let currentPlayer = player1;
    let gameOver = false;

    function reset() {
        gameOver = false;
        currentPlayer = player1;
        board.reset();
        console.log(`New game started!`);
        console.log(`${currentPlayer.getName()} goes first.`);
    }

    function tryPlaceMarker(x, y) {
        if (gameOver) {
            console.log("Game is over. Restart or create a new game.");
            return false;
        }

        if (board.get(x,y) !== null) {
            console.log(`Space (${x}, ${y}) is occupied!`);
            return false;
        }

        board.set(x, y, currentPlayer);
        console.log(`${currentPlayer.getName()} placed a piece at pos: (${x}, ${y}).`);

        if (checkGameOver())
            return true;

        currentPlayer = (currentPlayer === player1)? player2 : player1;
        console.log(`It's ${currentPlayer.getName()}'s turn.`);
        return true;
    }

    function checkGameOver() {
        if (checkPlayerWon()) {
            console.log(`${currentPlayer.getName()} won!`);
            gameOver = true;
            ui.showWin(currentPlayer.getName());
            return true;
        }

        if (board.isFull()) {
            console.log("It's a tie!");
            gameOver = true;
            ui.showTie();
            return true;
        }

        return false;
    }

    function getWinningCells() {
        const winningCells = new Set();

        let hasDiag1 = true;
        let hasDiag2 = true;
        const diag1 = [];
        const diag2 = [];
        
        for (let i = 0; i < 3; i++) {
            let hasCol = true;
            let hasRow = true;
            const col = [];
            const row = [];

            for (let j = 0; j < 3; j++) {
                hasCol &&= board.get(i,j) === currentPlayer;
                hasRow &&= board.get(j,i) === currentPlayer;
                col.push({x: i, y: j});
                row.push({x: j, y: i});
            }

            if (hasRow) {
                row.forEach(cell => winningCells.add(cell));
            }

            if (hasCol) {
                col.forEach(cell => winningCells.add(cell));
            }

            hasDiag1 &&= board.get(i,i) === currentPlayer;
            hasDiag2 &&= board.get(i,2-i) === currentPlayer;
            diag1.push({x: i, y: i});
            diag2.push({x: i, y: 2-i});
        }

        if (hasDiag1) {
            diag1.forEach(cell => winningCells.add(cell));
        }

        if (hasDiag2) {
            diag2.forEach(cell => winningCells.add(cell));
        }

        return winningCells;
    }

    function checkPlayerWon() {
        return !!getWinningCells().size;
    }

    function getCurrentPlayer() {
        return (player1 === currentPlayer) ? "player1" : "player2";
    }

    reset();
    return { tryPlaceMarker, reset, getCurrentPlayer, getWinningCells };
};


const app = (function() {
    let game = null;

    function reset() {
        if (game)
            game.reset();
    }

    function startNewGame(player1Name, player2Name) {
        const player1 = createPlayer(player1Name);
        const player2 = createPlayer(player2Name);
        game = createGame(player1, player2);
    }

    function tryPlaceMarker(x, y) {
        if (game)
            return game.tryPlaceMarker(x, y);
        return false;
    }

    function getCurrentPlayer() {
        if (game)
            return game.getCurrentPlayer();
        return null;
    }

    function getWinningCells() {
        if (game)
            return game.getWinningCells();
        return null;
    }

    return { reset, startNewGame, tryPlaceMarker, getCurrentPlayer, getWinningCells };
})();


const ui = (function() {
    function createBoardUI() {
        const board = document.querySelector(".board");
        board.addEventListener("click", handleTileClick);
    
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                const tile = createTile(x, y);
                board.appendChild(tile);
            }
        }
    }

    function createTile(x, y) {
        const template = document.querySelector(".template");
        const tile = template.cloneNode(true);
        tile.classList.remove("template");
        tile.dataset.col = x;
        tile.dataset.row = y;
    
        return tile;
    }

    function resetBoard() {
        const tiles = document.querySelectorAll(".board .tile");
        tiles.forEach(tile => {
            tile.dataset.marker = "empty";
            tile.classList.remove('winning-tile-player1');
            tile.classList.remove('winning-tile-player2');
        })
    }

    function handleTileClick(event) {
        const tile = event.target.closest(".tile");

        if (!tile)
            return;
    
        const col = tile.dataset.col;
        const row = tile.dataset.row;
        
        if (col === undefined || row === undefined)
            return;
    
        const player = app.getCurrentPlayer();
        
        if (app.tryPlaceMarker(col, row))
            tile.dataset.marker = player === "player1" ? "cross" : "circle";
    }

    function handleNewGame(event) {
        const form = event.target;
        const player1Name = form.player1name.value;
        const player2Name = form.player2name.value;
        const player1nameElem = document.querySelector(".player1name");
        const player2nameElem = document.querySelector(".player2name");
        const resultDialog = document.querySelector('.result-dialog');
        
        app.startNewGame(player1Name, player2Name);
        player1nameElem.textContent = player1Name;
        player2nameElem.textContent = player2Name;
        resultDialog.close();
        resetBoard();
    }

    function handleReset() {
        const resultDialog = document.querySelector('.result-dialog');
        resultDialog.close();
        app.reset();
        resetBoard();
    }

    function showWin(playerName) {
        const resultDialog = document.querySelector('.result-dialog');
        resultDialog.textContent = `${playerName} has won!`;
        resultDialog.show();

        const winningPlayer = app.getCurrentPlayer();
        const winningCells = app.getWinningCells();
        winningCells.forEach( cell => {
            const tile = document.querySelector(`.tile[data-col="${cell.x}"][data-row="${cell.y}"]`);
            tile.classList.add(`winning-tile-${winningPlayer}`);
        })
    }

    function showTie() {
        const resultDialog = document.querySelector('.result-dialog');
        resultDialog.textContent = `It's a tie!`;
        resultDialog.show();
    }
    
    const newGameDialog = document.querySelector(".new-game-dialog");
    newGameDialog.addEventListener("submit", handleNewGame);
    newGameDialog.addEventListener('keydown', e => {
        if (e.key === "Escape")
            e.preventDefault();
    })

    const resetButton = document.querySelector(".reset");
    resetButton.addEventListener("click", handleReset);
    
    const newGameButton = document.querySelector(".new-game-button");
    newGameButton.addEventListener("click", () => newGameDialog.showModal());


    createBoardUI();
    newGameDialog.showModal();
    
    return { showWin, showTie };
})();
