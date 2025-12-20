import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    whitePlayer: { type: mongoose.Schema.Types.ObjectId,
         ref: 'User' },
    blackPlayer: { type: mongoose.Schema.Types.ObjectId
        , ref: 'User' },
    currentTurn: { type: String,
         enum: ['white', 'black'], 
         default: 'white' },
    
    pgn: { type: String,
         default: '' }, 
    fen: { type: String
        , default: 'start' }, 
    
    status: { 
        type: String, 
        enum: ['waiting', 'active', 'checkmate', 'stalemate', 'draw', 'resigned'],
        default: 'waiting' 
    },
    
    winner: { type: String, enum: ['white', 'black', 'draw'], default: null },
    result: String, 
    
    createdAt: { type: Date, default: Date.now }
});

export const Game = mongoose.model("Game", gameSchema);