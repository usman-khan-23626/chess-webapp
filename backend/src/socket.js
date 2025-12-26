import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Game } from './models/game.mongo.js';
import { makemove } from './services/chess.service.js';

let io;
const pendingDrawOffers = new Map(); 
export function initializeSocket(server) {
    io = new Server(server, {
        cors: { origin: "*" },
        connectionStateRecovery: {}
    });

    
io.use(async (socket, next) => {
    try {
     const token = socket.handshake.auth.token;
     if (!token) throw new Error('No token');
            
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
     socket.userId = decoded.id;
      socket.userColor = {}; 
            
            next();
     } catch (error) {
          next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
    console.log(` ${socket.userId} connected`);

        
        socket.on('join-game', async (gameId) => {
                try {
            
            const game = await Game.findById(gameId);
            if (!game) throw new Error('Game not found');
                
        const isWhite = game.whitePlayer.equals(socket.userId);
         const isBlack = game.blackPlayer && game.blackPlayer.equals(socket.userId);
                
        if (!isWhite && !isBlack) {
          throw new Error('You are not a player in this game');
             }
                
               
         socket.userColor[gameId] = isWhite ? 'white' : 'black';
                socket.join(`game-${gameId}`);
      socket.currentGame = gameId;
                
       console.log(` ${socket.userId} joined game ${gameId} as ${socket.userColor[gameId]}`);
                
              
  socket.emit('game-state', {
   fen: game.fen,turn: game.currentTurn,status: game.status,pgn: game.pgn
                });
                
                  socket.to(`game-${gameId}`).emit('player-joined');
                
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        
socket.on('make-move', async (data) => {
    const { gameId, from, to, promotion } = data;
            
   try {
   if (!socket.currentGame || socket.currentGame !== gameId) {
        throw new Error('Not in this game');
        }
                
    const game = await Game.findById(gameId);
     if (!game) throw new Error('Game not found');
       if (game.status !== 'active') throw new Error('Game not active');
              
      if (socket.userColor[gameId] !== game.currentTurn) {
       throw new Error('Not your turn!');
       }
                
                
      const moveString = promotion ? `${from}-${to}=${promotion}` : `${from}-${to}`;
      const moveResult = makemove(game.fen, moveString);
                
         if (!moveResult.success) {
          throw new Error(moveResult.error);
      }
                
    const updatedGame = await Game.findOneAndUpdate(
            { 
                _id: gameId,
          currentTurn: game.currentTurn 
           },
                    {
         $set: {
                            fen: moveResult.fen,
                pgn: moveResult.pgn,
    currentTurn: moveResult.turn,
       ...(moveResult.checkmate && {
        status: 'checkmate',
      winner: socket.userColor[gameId],
     endedAt: new Date()
              }),
         ...(moveResult.stalemate && {
         status: 'stalemate',
        winner: 'draw',
     endedAt: new Date()
          })
          }
       },
      { new: true }          );
                
    if (!updatedGame) {
        throw new Error('Move already processed or turn changed');
                }
                
             
        io.to(`game-${gameId}`).emit('move-made', {
                    from, to,
                    fen: moveResult.fen,
                    turn: moveResult.turn,
                    check: moveResult.check,
                    checkmate: moveResult.checkmate,
                    gameOver: moveResult.gameOver
        });
                
                console.log(` ${socket.userId} moved ${from}-${to} in ${gameId}`);
                
            } catch (error) {
                socket.emit('move-error', error.message);
                console.error('Move error:', error.message);
            }
        });

        
        socket.on('offer-draw', async (gameId) => {
            try {
                const game = await Game.findById(gameId);
                if (!game) throw new Error('Game not found');
                
             
                const isPlayer = game.whitePlayer.equals(socket.userId) || 
                                (game.blackPlayer && game.blackPlayer.equals(socket.userId));
                if (!isPlayer) throw new Error('Not a player');
                
              
                pendingDrawOffers.set(gameId, {
                    by: socket.userId,
                    timestamp: Date.now()
                });
                
                
                setTimeout(() => {
                    if (pendingDrawOffers.get(gameId)?.by === socket.userId) {
                        pendingDrawOffers.delete(gameId);
                    }
                }, 60000);
                
           
                socket.to(`game-${gameId}`).emit('draw-offered', {
                    by: socket.userId,
                    expiresIn: 60
                });
                
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        socket.on('accept-draw', async (gameId) => {
            try {
                const offer = pendingDrawOffers.get(gameId);
                if (!offer) throw new Error('No active draw offer');
                
                
                if (offer.by === socket.userId) {
                    throw new Error('Cannot accept your own draw offer');
                }
                
                const game = await Game.findById(gameId);
                if (game) {
                    game.status = 'draw';
                    game.winner = 'draw';
                    game.endedAt = new Date();
                    await game.save();
                }
                
                pendingDrawOffers.delete(gameId);
                io.to(`game-${gameId}`).emit('game-ended', {
                    result: 'draw',
                    reason: 'agreement'
                });
                
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        socket.on('reject-draw', (gameId) => {
            const offer = pendingDrawOffers.get(gameId);
            if (offer && offer.by !== socket.userId) {
                socket.to(`game-${gameId}`).emit('draw-rejected');
                pendingDrawOffers.delete(gameId);
            }
        });

     
        socket.on('resign-game', async (gameId) => {
            try {
                const game = await Game.findById(gameId);
                if (!game) throw new Error('Game not found');
                
                game.status = 'resigned';
                game.winner = socket.userColor[gameId] === 'white' ? 'black' : 'white';
                game.endedAt = new Date();
                await game.save();
                
                io.to(`game-${gameId}`).emit('game-ended', {
                    result: game.winner,
                    reason: 'resignation'
                });
                
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

    
        socket.on('send-message', (data) => {
            const { gameId, message } = data;
            if (socket.currentGame === gameId) {
                io.to(`game-${gameId}`).emit('receive-message', {
                    userId: socket.userId,
                    message: message,
                    timestamp: new Date()
                });
            }
        });

      
        socket.on('disconnect', () => {
            console.log(` ${socket.userId} disconnected`);
            if (socket.currentGame) {
                socket.to(`game-${socket.currentGame}`).emit('player-disconnected');
            }
        });
    });
}

export function getIO() {
    return io;
}