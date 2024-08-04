const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chessMatch = new Schema({
    type_match: { type: String, required: true },
    white_player: { type: String },
    black_player: { type: String },
    result: { type: String },
    moves: { type: Array },
    is_closed: { type: Boolean, default: false },
    start_time: { type: Date },
    end_time: { type: Date },
    end_watch: { type: String },
    likes: {type: Array, default: []},
});

module.exports = mongoose.model('chessMatch', chessMatch, 'chessMatch');