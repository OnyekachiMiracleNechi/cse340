/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const app = express() // ✅ define app EARLY
const expressLayouts = require("express-ejs-layouts")
const bodyParser = require("body-parser")
const session = require("express-session")
const flash = require("connect-flash")
const pgSession = require("connect-pg-simple")(session)
const env = require("dotenv").config()
const pool = require("./database/")
const utilities = require("./utilities/")


// Route and Controller Imports
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")

/* ***********************
 * Middleware
 *************************/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

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
    cookie: { secure: false }, // Set true only if using HTTPS
  })
)

// Flash Messages Middleware
app.use(flash())

// Custom middleware to expose flash messages to all views
app.use((req, res, next) => {
  res.locals.message = req.flash("message")
  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")
  next()
})

/* ***********************
 * Static Files
 *************************/
app.use(express.static("public"))

/* ***********************
 * Template Engine
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout") // Uses /views/layouts/layout.ejs

/* ***********************
 * Routes
 *************************/
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)
// app.use("/", static) // Optional

/* ***********************
 * 404 Handler
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Congrats! You broke it." })
})

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  const message = err.status == 404
    ? err.message
    : "Oh no! There was a crash. Maybe try a different route?"
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
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
