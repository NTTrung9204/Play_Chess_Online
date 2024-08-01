const userDB = require("../models/user");
const roomDB = require("../models/room");
const getRecord = require("../utils/getRecord");

var player_storage = {};
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
                                    socket.emit("user_connect-socket", user_id, user_name, room, room.host_room);
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
                                        _io.to(room_id).emit("user_disconnect", user_id, user_name, room.host_room, host_change);
                                        player_storage[room_id] = player_storage[room_id].filter((player) => player.socket_id != socket.id);
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
    }
}

module.exports = new socketService();