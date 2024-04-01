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

// import user
const db = require("./config/db");
const route = require("./routes");
// config
require("dotenv").config();

// main
db.connect();
const app = express();
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    helpers: require("./helpers/handlebars"),
    sum: (a, b) => a + b,
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "resources/views/layouts"),
  })
);
// Cấu hình multer
const storage = multer.diskStorage({
  destination: "./public/img/product",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

app.set("view engine", ".hbs");
app.set("views", "./views");
app.set("views", path.join(__dirname, "resources", "views"));
const port = process.env.PORT || 3000;
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: false,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);
app.use(flash());
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
app.use((req, res, next) => {
  if (req.session.name) {
    res.locals.name = req.session.name;
  }
  next();
});
app.use(function (req, res, next) {
  res.locals.message = req.flash("message")[0];
  next();
});

// router
route(app);

app.listen(3000, () => {
  console.log(`Server is running on port ${port}: http://localhost:${port}`);
});
