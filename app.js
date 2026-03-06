require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
let MongoStore = require("connect-mongo");
const path = require("path");
const morgan = require("morgan");

const passport = require("./config/passport");
const {
  startExpired,
  StockExpire,
  manageExpiration,
} = require("./utils/service/cron");

const { PORT } = require("./utils/env");

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    }),
  }),
);
app.use(morgan("dev"))
const nocache = require("nocache");
app.use(nocache());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "assets")));

app.use(passport.initialize());
app.use(passport.session());


app.get("/health", (req, res) => {
  res.status(httpStatusCode.OK).json({
    status: httpResponse.OK,
    timestamp: Date.now()
  });
});

const userRouter = require("./router/user");
const adminRouter = require("./router/admin");

app.use("/", userRouter);
app.use("/admin", adminRouter);

const connectDB = require("./config/db");
const httpStatusCode = require("./constant/httpStatusCode");
const httpResponse = require("./constant/httpResponse");
startExpired();
StockExpire();
manageExpiration();
app.listen(PORT, () => {
  connectDB();
  console.log(".................. RUNNING....................");
});
