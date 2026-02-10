import { Server } from "socket.io";
import { Game } from "../models/game.mongo.js";
import { makemove } from "../services/chess.service.js";

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("join_game", async (gameId) => {
            socket.join(gameId);
            console.log(`User ${socket.id} joined game: ${gameId}`);

            // Optionally send the current state of the game
            try {
                const game = await Game.findById(gameId)
                    .populate('whitePlayer', 'name rating')
                    .populate('blackPlayer', 'name rating');

                if (game) {
                    socket.emit("game_state", {
                        fen: game.fen,
                        turn: game.currentTurn,
                        status: game.status,
                        whitePlayer: game.whitePlayer,
                        blackPlayer: game.blackPlayer
                    });

                    // Notify room if game just became active
                    if (game.status === 'active') {
                        io.to(gameId).emit("game_start", {
                            whitePlayer: game.whitePlayer,
                            blackPlayer: game.blackPlayer
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching game on join:", error);
            }

        });

        socket.on("move", async ({ gameId, from, to, promotion, userId }) => {
            try {
                const game = await Game.findById(gameId);
                if (!game) {
                    return socket.emit("error", { message: "Game not found" });
                }

                if (game.status !== 'active') {
                    return socket.emit("error", { message: "Game not active" });
                }

                // Verify it's the player's turn (simplified check for now)
                const userColor = game.whitePlayer.equals(userId) ? 'white' : 'black';
                if (userColor !== game.currentTurn) {
                    return socket.emit("error", { message: "Not your turn!" });
                }

                const moveString = promotion ? `${from}-${to}=${promotion}` : `${from}-${to}`;
                const moveResult = makemove(game.fen, moveString);

                if (!moveResult.success) {
                    return socket.emit("error", { message: moveResult.error });
                }

                // Update game in DB
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

                // Broadcast move to all players in the room
                io.to(gameId).emit("move_made", {
                    fen: moveResult.fen,
                    turn: moveResult.turn,
                    move: moveResult.move,
                    status: game.status,
                    gameOver: moveResult.gameOver,
                    check: moveResult.check,
                    checkmate: moveResult.checkmate,
                    winner: game.winner
                });


            } catch (error) {
                console.error("Socket move error:", error);
                socket.emit("error", { message: "Internal server error during move" });
            }
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected:", socket.id);
        });
    });

    return io;
};
