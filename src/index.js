const express = require("express");
const app = express();
const port = 3000;
const { engine } = require("express-handlebars");
const path = require("path");
const routes = require("./routes");
const db = require('./config/db')

db.connect()

app.use(express.static(path.join(__dirname, "public")));
app.use(
    express.urlencoded({
        extended: true,
    })
);
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
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources/views"));

routes(app);

app.listen(port, () => console.log(`http://localhost:${port}`));
