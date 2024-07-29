const roomDB = require("../models/room");
const getRecord = require("../utils/getRecord");
const getRandom = require("../utils/getRandom");

class normalMatchController {
    // [GET] /normalMatch
    index(req, res) {
        roomDB.find()
            .then((rooms) => {
                rooms = getRecord.getListOfRecords(rooms);
                rooms = rooms.filter((room) => room.type_room === "normal" && !room.is_closed);
                res.render("room/lobbyNormalRoom", { rooms });
            })
            .catch((error) => {
                console.log("get rooms failure!");
                console.log(error);
                res.json({ error: "get rooms failure!" });
            });
    }

    // [GET] /normalMatch/create_room
    create_room(req, res) {
        const user_id = req.session.user_id;
        if(user_id){
            const name_room = getRandom.getNameRoom();
            roomDB.create({ type_room: "normal", name_room, white_player: user_id })
                .then((new_room) => {
                    console.log("create room success!" + name_room + " " + new_room._id);
                    res.redirect("/normalMatch/" + new_room._id);
                })
                .catch((error) => {
                    console.log("create room failure!");
                    console.log(error);
                    res.json({ error: "create room failure!" });
                });
        }
        else {
            console.log("create room failure!: have not logged in yet");
            res.send("have not logged in yet");
        }
    }

    // [GET] /normalMatch/:id_room
    join_room(req, res) {
        const user_id = req.session.user_id;
        const id_room = req.params.id_room;
        if(user_id){
            roomDB.findById(id_room)
                .then((room) => {
                    room = getRecord.getOneRecord(room);
                    if(room){
                        if(!room.is_closed){
                            res.render("room/normalRoom", { room });
                        }
                        else{
                            console.log("join room failure!: room is closed");
                            res.send("room is closed");
                        }
                    }
                    else{
                        console.log("join room failure!: invalid room id");
                        res.send("invalid room id");
                    }
                })
                .catch((error) => {
                    console.log("join room failure!");
                    console.log(error);
                    res.json({ error: "join room failure!" });
                });
        }
        else {
            console.log("join room failure!: have not logged in yet");
            res.send("have not logged in yet");
        }
    }
}

module.exports = new normalMatchController();