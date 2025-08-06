/* ******************************************
 * Primary file to control the project.
 *******************************************/
const cookieParser = require("cookie-parser")
const express = require("express")
const app = express()
const expressLayouts = require("express-ejs-layouts")
const bodyParser = require("body-parser")
const session = require("express-session")
const flash = require("connect-flash")
const pgSession = require("connect-pg-simple")(session)
const env = require("dotenv").config()
const pool = require("./database/")
const utilities = require("./utilities/")

// Route imports
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const favoritesRoute = require("./routes/favoritesRoute")

/* ***********************
 * Middleware
 *************************/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Session Middleware
app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET || "super_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
)

// Flash Messages
app.use(flash())

// Make flash messages and user session available in all views
app.use((req, res, next) => {
  res.locals.message = req.flash("message")
  res.locals.notice = req.flash("notice")
  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")
  res.locals.accountData = req.session.account
  next()
})

app.use(cookieParser())
app.use(utilities.checkJWTToken)

/* ***********************
 * Static Files
 *************************/
app.use(express.static("public"))

/* ***********************
 * View Engine
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout")

/* ***********************
 * Routes
 *************************/
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

app.use("/account/favorites", favoritesRoute)
// app.use("/", static) // optional if you want to serve other static routes

/* ***********************
 * 404 Not Found Handler
 *************************/
app.use((req, res, next) => {
  next({ status: 404, message: "Congrats! You broke it." })
})

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav()
  const status = err.status || 500
  const message =
    status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?"

  console.error(`\nError at: "${req.originalUrl}"`)
  console.error("Message:", err.message)
  console.error("Stack:", err.stack)

  res.status(status).render("errors/error", {
    title: status,
    message,
    nav,
  })
})

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`)
})
