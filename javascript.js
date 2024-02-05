const Board = () => {
    let board = Array.from(Array(9).keys())
    

    function add(player, position) {
        this.board[position] = player.symbol
    }
    function isValid(position) {
        return typeof this.board[position] == "number" ? true : false
    }
    
    function isTie() {
        return this.board.every((item) => typeof item == "string")
    }
    
    return { add, isValid, isTie, board }
}
const Player = (symbol) => {
    
    let move = []
    const winnerTri = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
    function add(position) {
        this.move.push(position)
    }
    function isWinner() {
        const convMove = this.move.map((item) => +item)
        let result
        for(const arr of winnerTri) {
            result = arr.every((item) => convMove.includes(item))
            if (result || arr == winnerTri[winnerTri.length -1]) {
                break
            }
        }
        return result 
    }
    
    return { symbol, isWinner, add, move }
}
const displayController = (() => {
    const announcementDom = document.getElementById("announcement")
    const turnDom = document.getElementById("turn")
    const boardDom = document.getElementById("game-board")
    const result = (result, player) => {
        if (result == "w") {
            // annouce winner
            turnDom.textContent = `${player.symbol} win!`
        } else {
            // announce tie
            turnDom.textContent = "You tie!"
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
        turnDom.textContent = `Player ${player.symbol} please make your move!`
    }
    const instruct = () => {
        const insDiv = document.getElementById('ins-com')
        insDiv.classList.add('display')
        insDiv.textContent = "You will be O and computer will be X."
    }
    const display = (node) => {
        node.classList.add("display")
    }
    const remove = (node) => {
        node.classList.remove("display")
    }
    return { result, board, askForMove, display, instruct, remove }
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
                    // disable click so that no invalid move will be made
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
const Computer = (symbol) => {
    const {isWinner, add, move} = Player(symbol)
    function geMove(board, player, opponent) {
        // save the original state
        const oriBoard = JSON.stringify(board)
        const oriPlayer = JSON.stringify(player)
        const oriOppo = JSON.stringify(opponent)
        let result = {}
        const moves = possMoves(board)
        for(let i=0; i < moves.length; i++) {
            player.add(moves[i])
            board.add(player, moves[i])
            if(player.symbol == symbol && player.isWinner()) {
                result[moves[i]] = {score: 1, step: 0}
            } else if(player.symmbol != symbol && player.isWinner()) {
                result[moves[i]] = {score: -1, step: 0}
            } else if(board.isTie()) {
                result[moves[i]] = {score: 0, step: 0}
            } else {
                const conseResult = Object.values(geMove(board, opponent, player))[0]
                result[moves[i]] = {score: conseResult.score, step: conseResult.step++}
            }
            board.board = JSON.parse(oriBoard).board
            player.move = JSON.parse(oriPlayer).move
            opponent.move = JSON.parse(oriOppo).move
        }
        return optMove(result, player)
    }
    const optMove = (result, player) => {
        let scores = []
        for(let key in result) {
            scores.push(result[key].score)
        }
        const optScore = player.symbol == symbol ? Math.max(...scores) : Math.min(...scores)
        let minStep
        let final = {}
        for(let key in result) {
            if(result[key].score == optScore) {
                if(!minStep || (minStep && result[key].step <= minStep)) {
                    final[key] = result[key]
                    minStep = result[key].step
                }
            }
        }
        return final
    }
    const possMoves = (board) => {
        return board.board.filter((item) => typeof(item) != "string")
    }
    
    return {symbol, geMove, add, isWinner, move}
}
const game = (() => {
    const play = async function() {
        displayController.display(document.getElementById("game-board"))
        displayController.remove(document.getElementById('ins-com'))
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
    const playWithC = async function() {
        displayController.display(document.getElementById("game-board"))
        displayController.instruct()
        const o = Player("O")
        const x = Computer("X")
        const board = Board()
        for(let i=0; i<=8; i++) {
            displayController.board(board.board) 
            let player = choosePlayer(i, x, o)
            
            while(true) {
                let move
                if(player == o) {
                    move = await listenerController.getMove(player)
                } else {
                    move = Object.keys(x.geMove(board, x, o))[0]
                }
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
    return { play, playWithC }
})()

// window.addEventListener("load", game.play)
document.getElementById("new-game").addEventListener("click", game.play)
document.getElementById("play-computer").addEventListener("click", game.playWithC)

