import { Chess } from "chess.js"

export function createnewgame(){
    const chess = new Chess();
    return({
        fen:chess.fen(),
        pgn :chess.pgn(),
        turn: 'white'
    });
}
export function makemove(currentfen,move){
    try{const chess = new Chess(currentfen);
    const result = chess.move(move);

    return({
          success: true,
            fen: chess.fen(),
            pgn: chess.pgn(),
            turn: chess.turn() === 'w' ? 'white' : 'black',
            move: result,
            gameOver: chess.isGameOver(),
            check: chess.isCheck(),
            checkmate: chess.isCheckmate(),
            stalemate: chess.isStalemate(),
            draw: chess.isDraw()
    });}catch(error){
    console.error("Move failed", error); 
      return { 
        success: false,
        error: error.message 
    }
    }
}

export function  getGameStatus(fen) {
    const chess = new Chess(fen);
    return {
        fen: chess.fen(),
        turn: chess.turn() === 'w' ? 'white' : 'black',
        gameOver: chess.isGameOver(),
        check: chess.isCheck(),
        checkmate: chess.isCheckmate()
    };
}