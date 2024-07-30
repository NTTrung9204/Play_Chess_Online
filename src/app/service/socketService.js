const userDB = require("../models/user");
const roomDB = require("../models/room");
const getRecord = require("../utils/getRecord");

var player_storage = {};
class socketService{
    connection(socket){
        socket.on('join', (room_id, user_id, user_name, white_player_id, black_player_id)=>{
            socket.join(room_id);
            const role_room = (user_id == white_player_id || user_id == black_player_id)? "player" : "viewer";
            const new_connection = {socket_id: socket.id, user_id: user_id, user_name: user_name, role_room: role_room};
            player_storage[room_id] ? player_storage[room_id].push(new_connection) : player_storage[room_id] = [new_connection];
            _io.to(room_id).emit("user_connect", user_id, user_name);
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
                                else if(room.black_player == user_id){
                                    room.black_player = null;
                                }
                                room.save()
                                    .then(() => {
                                        _io.to(room_id).emit("user_disconnect", user_id, user_name);
                                        player_storage[room_id] = player_storage[room_id].filter((player) => player.socket_id != socket.id);
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
                                        if(player == "White" && !room.white_player){
                                            room.white_player = user_id;
                                        }
                                        else if(player == "Black" && !room.black_player){
                                            room.black_player = user_id;
                                        }
                                        else{
                                            console.log("join__normal__room failure!: player is not available");
                                            return;
                                        }
                                        room.save()
                                            .then(() => {
                                                console.log("join__normal__room success!");
                                                _io.to(room_id).emit("join__normal__room", player, user.username);
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