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

const server = http.createServer(app); // Tạo HTTP server
const io = new Server(server); // Tạo WebSocket server

// Socket.IO: Đăng ký sự kiện kết nối
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Nhận sự kiện `newOrder` từ phía client
  socket.on("newOrder", (orderData) => {
    console.log("Đơn hàng mới:", orderData);

    // Gửi thông báo đến tất cả admin
    io.emit("notifyAdmin", orderData);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

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

app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "resources", "views"));
const port = process.env.PORT || 3000;
app.use(
  session({
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
  })
);
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

// router
route(app);

// Lắng nghe server qua HTTP server (có Socket.IO)
server.listen(port, () => {
  console.log(`Server is running on port ${port}: http://localhost:${port}`);
});
