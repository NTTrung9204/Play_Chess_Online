const userDB = require("../models/user");
const roomDB = require("../models/room");
const getRecord = require("../utils/getRecord");

var player_storage = {};
class socketService{
    connection(socket){
        socket.on('join', (room_id, user_id)=>{
            console.log("join room: " + room_id);
            socket.join(room_id);
            if (player_storage[room_id]) {
                player_storage[room_id].push({socket_id: socket.id, user_id: user_id});
            }
            else{
                player_storage[room_id] = [{socket_id: socket.id, user_id: user_id}];
            }
        })
        
        socket.on("disconnect", (arg) => {

        });

        socket.on("disconnecting", () => {
            const rooms = [...socket.rooms];
            if (rooms.length > 1) {
                const room_id = rooms[1];
                const user_id = player_storage[room_id].find((player) => player.socket_id == socket.id).user_id;
                _io.to(room_id).emit("user_disconnect", user_id);
                console.log("disconnecting: " + user_id);
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