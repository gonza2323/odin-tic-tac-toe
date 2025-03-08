"use strict";


function createPlayer(name) {

    function getName() {
        return name;
    }

    return { getName };
}


function createBoard() {
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
}


const game = (function() {
    const board = createBoard();
    const player1 = createPlayer("Alice");
    const player2 = createPlayer("Bob");
    let currentPlayer = null;


    function init() {
        board.reset();
        currentPlayer = player1;
        console.log(`New game started!`);
        console.log(`${currentPlayer.getName()} goes first.`);
    }


    function placeMarker(x, y) {
        if (board.get(x,y) !== null) {
            console.log(`Space (${x}, ${y}) is occupied!`);
            return false;
        }

        board.set(x, y, currentPlayer);
        console.log(`${currentPlayer.getName()} placed a piece at pos: (${x}, ${y}).`);

        if (checkPlayerWon(currentPlayer)) {
            console.log(`${currentPlayer.getName()} won!`);
            init();
            return true;
        }

        if (board.isFull()) {
            console.log("It's a tie!");
            return true;
        }

        currentPlayer = (currentPlayer === player1)? player2 : player1;
        console.log(`It's ${currentPlayer.getName()}'s turn.`);
        return true;
    }


    function checkPlayerWon(player) {
        let hasDiag1 = true;
        let hasDiag2 = true;
        
        for (let i = 0; i < 3; i++) {
            let hasCol = true;
            let hasRow = true;

            for (let j = 0; j < 3; j++) {
                hasCol &&= board.get(i,j) === player;
                hasRow &&= board.get(j,i) === player;
            }

            if (hasCol || hasRow) { return true; }

            hasDiag1 &&= board.get(i,i) === player;
            hasDiag2 &&= board.get(i,2-i) === player;
        }

        return (hasDiag1 || hasDiag2);
    }


    init();

    return { placeMarker };
})();


// UI

function createBoardUI() {
    const board = document.querySelector(".board");

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
    tile.dataset.column = x;
    tile.dataset.row = y;

    return tile;
}


createBoardUI();
