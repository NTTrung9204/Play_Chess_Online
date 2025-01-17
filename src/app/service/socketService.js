const userDB = require("../models/user");
const roomDB = require("../models/room");
const getRecord = require("../utils/getRecord");

var player_storage = {};
var match_storage = {};
class socketService{
    connection(socket){
        socket.on('join', (room_id, user_id, user_name, white_player_id, black_player_id, host_room)=>{
            roomDB.findById(room_id)
                .then((room) => {
                    room = getRecord.getOneRecord(room);
                    if(room){
                        if(!room.is_closed){
                            const white_player = userDB.findById(room.white_player);
                            const black_player = userDB.findById(room.black_player);
                            const current_player = userDB.findById(user_id);
                            Promise.all([white_player, black_player, current_player])
                                .then((players) => {
                                    if(players[0]){
                                        room.white_player = getRecord.getOneRecord(players[0]);
                                    }
                                    if(players[1]){
                                        room.black_player = getRecord.getOneRecord(players[1]);
                                    }
                                    socket.join(room_id);
                                    const role_room = (user_id == white_player_id || user_id == black_player_id)? "player" : "viewer";
                                    const new_connection = {socket_id: socket.id, user_id: user_id, user_name: user_name, role_room: role_room, host_room: false};
                                    player_storage[room_id] ? player_storage[room_id].push(new_connection) : player_storage[room_id] = [new_connection];
                                    
                                    _io.to(room_id).emit("user_connect-io", user_id, user_name, room, room.host_room);
                                    var time_white_side_milisecond;
                                    var time_black_side_milisecond;
                                    var turn;
                                    if(match_storage[room_id]){
                                        time_white_side_milisecond = match_storage[room_id].current_time_white;
                                        time_black_side_milisecond = match_storage[room_id].current_time_black;
                                        if(match_storage[room_id].moves[0]){
                                            const temp = match_storage[room_id].moves[match_storage[room_id].moves.length - 1];
                                            const temp_array = temp.split(" ");
                                            turn = temp_array[1];
                                            if(turn == "w"){
                                                turn = "Black";
                                            }
                                            else{
                                                turn = "White";
                                            }
                                        }
                                    }
                                    socket.emit("user_connect-socket", user_id, user_name, room, room.host_room, time_white_side_milisecond, time_black_side_milisecond, turn);
                                })
                                .catch((error) => {
                                    console.log("join room failure!");
                                    console.log(error);
                                });
                        }
                        else{
                            console.log("join room failure!: room is closed");
                        }
                    }
                    else{
                        console.log("join room failure!: invalid room id");
                    }
                })
                .catch((error) => {
                    console.log("join failure!");
                    console.log(error);
                })
        })
        
        socket.on("disconnect", (arg) => {

        });

        socket.on("disconnecting", () => {
            const rooms = [...socket.rooms];
            if (rooms.length > 1) {
                const room_id = rooms[1];
                const user_infor = player_storage[room_id].find((player) => player.socket_id == socket.id);
                const user_id = user_infor.user_id;
                const user_name = user_infor.user_name;
                if(user_infor.role_room == "player"){
                    roomDB.findById(room_id)
                        .then((room) => {
                            if(room){
                                if(room.white_player == user_id){
                                    room.white_player = null;
                                }
                                if(room.black_player == user_id){
                                    room.black_player = null;
                                }
                                var host_change = false;
                                if(room.host_room == user_id){
                                    console.log("host room disconnect");
                                    room.host_room = room.white_player? room.white_player : room.black_player;
                                    host_change = true;
                                }
                                room.save()
                                    .then(() => {
                                        const host_user = player_storage[room_id].find((player) => player.user_id == room.host_room);
                                        if(host_user){
                                            _io.to(host_user.socket_id).emit("closeButtonStart", room.host_room);
                                        }
                                        _io.to(room_id).emit("user_disconnect", user_id, user_name, room.host_room, host_change);
                                        player_storage[room_id] = player_storage[room_id].filter((player) => player.socket_id != socket.id);
                                        if(player_storage[room_id].length == 0){
                                            delete player_storage[room_id];
                                            delete match_storage[room_id];
                                        }
                                        // update host
                                        if(room.host_room){
                                            player_storage[room_id].find((player) => player.user_id == room.host_room).host_room = true;
                                        }
                                        console.log(room.host_room);
                                        console.log("disconnect success!");
                                    })
                                    .catch((error) => {
                                        console.log("disconnect failure!");
                                        console.log(error);
                                    })
                            }
                            else{
                                console.log("disconnect failure!: room not found");
                            }
                        })
                        .catch((error) => {
                            console.log("disconnect failure!");
                            console.log(error);
                        })
                }
                else{
                                
                    _io.to(room_id).emit("user_disconnect", user_id, user_name);
                    player_storage[room_id] = player_storage[room_id].filter((player) => player.socket_id != socket.id);
                    console.log("disconnect success!");
                }
                
            }
            
        });

        socket.on("join__normal__room", (player, room_id, user_id) =>{
            if (room_id && user_id) {
                userDB.findById(user_id)
                    .then((user) => {
                        if(user){
                            user = getRecord.getOneRecord(user);
                            roomDB.findById(room_id)
                                .then((room) =>{
                                    if(room){
                                        if(player == "White" && !room.white_player && room.black_player != user_id){
                                            room.white_player = user_id;
                                        }
                                        else if(player == "Black" && !room.black_player && room.white_player != user_id){
                                            room.black_player = user_id;
                                        }
                                        else{
                                            console.log("join__normal__room failure!: player is not available");
                                            return;
                                        }
                                        var host_socket_id;
                                        var host_user_id;
                                        for (let i = 0; i < player_storage[room_id].length; i++) {
                                            if(player_storage[room_id][i].user_id == user_id){
                                                player_storage[room_id][i].role_room = "player";
                                            }
                                            if(player_storage[room_id][i].host_room){
                                                host_socket_id = player_storage[room_id][i].socket_id;
                                                host_user_id = player_storage[room_id][i].user_id;
                                            }
                                        }
                                        var flag = false;
                                        if(host_socket_id){
                                            flag = true;
                                        }
                                        else{
                                            for (let i = 0; i < player_storage[room_id].length; i++) {
                                                if(player_storage[room_id][i].user_id == user_id){
                                                    player_storage[room_id][i].host_room = true;
                                                    host_user_id = user_id;
                                                    room.host_room = user_id;
                                                    flag = true;
                                                }
                                            }
                                        }

                                        room.save()
                                            .then(() => {
                                                if(flag){
                                                    _io.to(room_id).emit("join__normal__room", player, user.username, user_id, host_user_id);
                                                    _io.to(host_socket_id).emit("add_role_of_host", true, host_user_id);
                                                    console.log("join__normal__room success!");
                                                }
                                                else{
                                                    console.log("something wrong!");
                                                }
                                            })
                                            .catch((error) => {
                                                console.log("join__normal__room failure!");
                                                console.log(error);
                                                return;
                                            })

                                    }
                                    else{
                                        console.log("join__normal__room failure!: room not found");
                                        return;
                                    }
                                })
                                .catch((error) => {
                                    console.log("join__normal__room failure!");
                                    console.log(error);
                                    return;
                                })
                        }
                        else{
                            console.log("join__normal__room failure!: user not found");
                            return;
                        }
                    })
            }
            else{
                console.log("join__normal__room failure!: invalid room id or user id");
                return;
            }
            
        })

        socket.on("kick__normal__room", (room_id, user_id) =>{
            const user_infor = player_storage[room_id].find((player) => player.user_id == user_id);
            _io.to(user_infor.socket_id).emit("kick__normal__room", user_infor.user_name);

        })

        socket.on("start__game", (room_id, white_player_id, black_player_id, time_white_side, time_black_side) =>{
            const time_black_side_milisecond = time_black_side * 60 * 1000;
            const time_white_side_milisecond = time_white_side * 60 * 1000;
            match_storage[room_id] = {
                room_id: room_id,
                time_white_side: time_black_side_milisecond,
                time_black_side: time_white_side_milisecond,
                current_time_white: time_white_side_milisecond,
                current_time_black: time_black_side_milisecond,
                first_move: "White",
                fen_string_start: "rrrrrrrr/pppppppp/8/8/8/8/PPPPPPPP/RRRRRRRR w KQkq - 0 1",
                moves: []
            }
            const white_player_socket_id = player_storage[room_id].find((player) => player.user_id == white_player_id).socket_id;
            const black_player_socket_id = player_storage[room_id].find((player) => player.user_id == black_player_id).socket_id;
            const list_viewer = player_storage[room_id].filter((player) => player.role_room == "viewer");
            _io.to(white_player_socket_id).emit("start__game", "White");
            _io.to(black_player_socket_id).emit("start__game", "Black");
            list_viewer.forEach((viewer) => {
                _io.to(viewer.socket_id).emit("start__game", "Viewer");
            })
            _io.to(room_id).emit("countdownEvent", match_storage[room_id].first_move);
        })

        socket.on("player_move", (room_id, fen_string, turn, countdown_time) =>{
            if(turn == "White"){
                match_storage[room_id].current_time_white = countdown_time;
            }
            else{
                match_storage[room_id].current_time_black = countdown_time;
            }
            match_storage[room_id].moves.push(fen_string);
            const new_turn = turn == "White"? "Black" : "White";
            _io.to(room_id).emit("new__move", fen_string, new_turn, countdown_time);
        })

        socket.on("game_over", (room_id, result, winner) =>{
            const host_socket_id = player_storage[room_id].find((player) => player.host_room).socket_id;
            const host_user_id = player_storage[room_id].find((player) => player.host_room).user_id;
            if(result === "checkmate"){
                _io.to(room_id).emit("game_over", result, winner);
            }
            else{
                _io.to(room_id).emit("game_over", result, null);
            }
            _io.to(host_socket_id).emit("go_to_start_mode", host_user_id);
        })
    }
}

module.exports = new socketService();