const express = require("express");
const app = express();
const port = 3000;
const { engine } = require("express-handlebars");
const path = require("path");
const routes = require("./routes");
const db = require("./config/db");
const session = require("express-session");
const sessionMiddleware = session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 600000000 },
});

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const socketService = require('./app/service/socketService');
global._io = io;

db.connect();

app.use(express.static(path.join(__dirname, "public")));
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json());
app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        helpers: {
            sum: (a, b) => a + b,
        },
    })
);
app.use(sessionMiddleware);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources/views"));

global._io.on('connection', socketService.connection)
routes(app);

server.listen(port, () => console.log(`http://localhost:${port}`));
