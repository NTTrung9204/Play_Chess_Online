const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const room = new Schema({
    name_room: { type: String, required: true },
    type_room: { type: String, required: true },
    white_player: { type: String },
    black_player: { type: String },
    host_room: { type: String },
    is_closed: { type: Boolean, default: false },
});

module.exports = mongoose.model('room', room, 'room');