import express from "express"
import { Game } from "../models/game.mongo.js"
import { varifytoken } from "../middleware/auth.js"
import { createnewgame, makemove } from "../services/chess.service.js"
const gameRouter = express.Router()


gameRouter.post("/create", varifytoken, async (req, res) => {
    try {
        const chessState = createnewgame();

        const game = new Game({
            whitePlayer: req.user._id,
            fen: chessState.fen,
            pgn: chessState.pgn,
            status: 'waiting'
        });

        await game.save();

        res.json({
            success: true,
            gameId: game._id,
            message: "Game created. Waiting for opponent...",
            fen: game.fen,
            turn: 'white'
        });

    } catch (error) {
        console.error("game creation failed", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


gameRouter.get("/available", varifytoken, async (req, res) => {
    try {
        const games = await Game.find({
            status: 'waiting',
            blackPlayer: null
        }).populate('whitePlayer', 'name rating');

        res.json({ games });
    } catch (error) {
        console.error("failed to fetch game", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


gameRouter.post("/join/:gameId", varifytoken, async (req, res) => {
    try {
        const game = await Game.findById(req.params.gameId);

        if (!game) return res.status(404).json({ error: "Game not found" });
        if (game.blackPlayer) return res.status(400).json({ error: "Game full" });

        game.blackPlayer = req.user._id;
        game.status = 'active';
        game.startedAt = new Date();

        await game.save();

        res.json({
            success: true,
            message: "Joined game! White moves first.",
            gameId: game._id,
            fen: game.fen,
            turn: 'white'
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to join game" });
    }
});

gameRouter.post("/:gameId/move", varifytoken, async (req, res) => {
    try {
        const { from, to, promotion } = req.body;
        const game = await Game.findById(req.params.gameId);

        if (!game) return res.status(404).json({ error: "Game not found" });
        if (game.status !== 'active') return res.status(400).json({ error: "Game not active" });


        const userColor = game.whitePlayer.equals(req.user._id) ? 'white' : 'black';
        if (userColor !== game.currentTurn) {
            return res.status(400).json({ error: "Not your turn!" });
        }


        const moveResult = makemove(game.fen, { from, to, promotion });


        if (!moveResult.success) {
            return res.status(400).json({ error: moveResult.error });
        }


        game.fen = moveResult.fen;
        game.pgn = moveResult.pgn;
        game.currentTurn = moveResult.turn;


        if (moveResult.checkmate) {
            game.status = 'checkmate';
            game.winner = userColor;
            game.endedAt = new Date();
        } else if (moveResult.stalemate || moveResult.draw) {
            game.status = 'draw';
            game.winner = 'draw';
            game.endedAt = new Date();
        }

        await game.save();

        res.json({
            success: true,
            fen: moveResult.fen,
            turn: moveResult.turn,
            move: moveResult.move,
            gameOver: moveResult.gameOver,
            check: moveResult.check,
            checkmate: moveResult.checkmate
        });

    } catch (error) {
        console.error("Move error:", error);
        res.status(500).json({ error: "Move failed" });
    }
});


gameRouter.get("/:gameId", varifytoken, async (req, res) => {
    try {
        const game = await Game.findById(req.params.gameId)
            .populate('whitePlayer', 'name rating')
            .populate('blackPlayer', 'name rating');

        if (!game) return res.status(404).json({ error: "Game not found" });

        res.json({ game });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch game" });
    }
});
export default gameRouter