const Board = () => {
    let board = Array.from(Array(9).keys())
    

    const add = (player, position) => {
        board[position] = player.symbol
    }
    const isValid = (position) => {
        return typeof board[position] == "number" ? true : false
    }
    
    const isTie = () => {
        return board.every((item) => typeof item == "string")
    }
    
    return { add, isValid, isTie, board }
}
const Player = (symbol) => {
    
    let move = []
    const winnerTri = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
    const add = (position) => {
        move.push(position)
    }
    const isWinner = () => {
        for(const arr of winnerTri) {
            let result = arr.every((item) => move.includes(item))
            if (result || arr == winnerTri[winnerTri.length -1]) {
                return result 
            }
        }
    }
    
    return { symbol, isWinner, add }
}
const displayController = (() => {
    const announcementDom = document.getElementById("announcement")
    const boardDom = document.getElementById("game-board")
    const result = (result, player) => {
        if (result == "w") {
            // annouce winner
            announcementDom.textContent = `Congratulation ${player.symbol}, you win!`
        } else {
            // announce tie
            announcementDom.textContent = "You tie!"
        }
    }
    const board = (boardArr) => {
        const cells = boardDom.getElementsByClassName("cell")
        for(let i=0; i<cells.length; i++) {
            if (typeof boardArr[i] != "number") {
                cells[i].textContent = boardArr[i]
            } else {
                cells[i].textContent = ""
            }
        }
    }
    const askForMove = (player) => {
        announcementDom.textContent = `player ${player.symbol} please make your move!`
    }
    
    return { result, board, askForMove }
})()
const listenerController = (() => {
    const boardDom = document.getElementById("game-board")
    const cells = boardDom.getElementsByClassName("cell")
    function getMove(player) {
        const cells = document.getElementsByClassName("cell")
        let promises = []
        for(let i=0; i<cells.length; i++) {
            const promise = new Promise((resolve) => {
                cells[i].addEventListener("click", function eventHandler() {
                    for(const cell of cells) {
                        cell.removeEventListener("click", eventHandler)
                    }
                    resolve(i)
                })
            })
            promises.push(promise)
        } 
        // after adding event listener for all of the cell, then we can ask for move
        displayController.askForMove(player)
        return Promise.any(promises)
    }
    return { getMove }
})()
const game = (() => {
    const play = async function() {
        const x = Player("X")
        const o = Player("O")
        const board = Board()
        for(let i=0; i<=8; i++) {
            displayController.board(board.board) 
            let player = choosePlayer(i, x, o)
            
            while(true) {
                const move = await listenerController.getMove(player)
                // disable click so that no invalid move will be made
                if (board.isValid(move)) {
                    player.add(move)
                    board.add(player, move)
                    break
                } 
            }
            let result = isOver(i, player, board)
            if (result != "") {
                displayController.result(result, player)
                displayController.board(board.board)
                return 
            }
            
        }
    } 
    
    

    function choosePlayer(i, x, o) {
        return i % 2 == 0 ? o : x
    }
    
    function isOver(i, player, board) {
        if (i>=4) {
            if (player.isWinner()) {
                return "w"
            } else {
                if (board.isTie()) {
                    return "t"
                }
                
            }
        }
        return ""
    }
    return { play }
})()

window.addEventListener("load", game.play)
document.getElementById("new-game").addEventListener("click", game.play)

