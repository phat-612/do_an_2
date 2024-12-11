// import node
const express = require("express");
const session = require("express-session");
const flash = require("express-flash");
const multer = require("multer");
const sharp = require("sharp");
const { engine } = require("express-handlebars");
const methodOverride = require("method-override");
const path = require("path");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const sharedSession = require("express-socket.io-session");

// Cấu hình Socket.IO
const http = require("http"); // Import http module
const { Server } = require("socket.io"); // Import Socket.IO

// import user
const db = require("./config/db");
const route = require("./routes");
const globalVariable = require("./app/middlewares/globalVariable");

// config
require("dotenv").config();

// main
db.connect();
const app = express();

app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
    },
    helpers: require("./helpers/handlebars"),
    sum: (a, b) => a + b,
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "resources/views/layouts"),
  })
);

// Cấu hình multer
// const storage = multer.diskStorage({
//   destination: "./public/img/product",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
app.set("view engine", ".hbs");
app.set("views", "./views");
app.set("views", path.join(__dirname, "resources", "views"));
const port = process.env.PORT || 3000;
const sessions = session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: false,
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
});
app.use(sessions);

app.use(flash());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/css",
  express.static(
    path.join(__dirname, "../node_modules", "bootstrap", "dist", "css")
  )
);
app.use(
  "/css",
  express.static(
    path.join(__dirname, "../node_modules", "bootstrap-icons", "font")
  )
);
app.use(
  "/css",
  express.static(path.join(__dirname, "../node_modules", "nouislider", "dist"))
);
app.use(
  "/css",
  express.static(
    path.join(__dirname, "../node_modules", "datatables.net-dt", "css")
  )
);
app.use(
  "/js",
  express.static(
    path.join(__dirname, "../node_modules", "bootstrap", "dist", "js")
  )
);
app.use(
  "/js",
  express.static(path.join(__dirname, "../node_modules", "nouislider", "dist"))
);
app.use(
  "/js",
  express.static(
    path.join(__dirname, "../node_modules", "datatables.net-dt", "js")
  )
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(globalVariable);
app.use(function (req, res, next) {
  res.locals.message = req.flash("message")[0];
  next();
});

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const { init } = require("../src/util/socket");

const server = http.createServer(app);
const io = init(server);
io.use(sharedSession(sessions, { autoSave: true }));
// router
route(app);

server.listen(3000, () => {
  console.log(`Server is running on port ${port}: http://localhost:${port}`);
});
