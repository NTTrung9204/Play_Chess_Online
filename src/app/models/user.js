const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    Elo: { type: Number, default: 0 },
    avatar: { type: String, default: 'default_avatart' },
    color: { type: String, default: 'black' },
    font_weight: { type: Number, default: 100 },
    friends: { type: Array, default: [] },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    Facebook: { type: String, default: '' },
    Twitter: { type: String, default: '' },
    Discord: { type: String, default: '' },
    Youtube: { type: String, default: '' },
    Instagram: { type: String, default: '' },
    blocked: { type: Boolean, default: false },
    reason_blocked: { type: String, default: '' },
    start_time: { type: Date, default: Date.now },
    end_time: { type: Date, default: null },
});

module.exports = mongoose.model('user', user,'user');