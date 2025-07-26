/* Require utilities */
const bcrypt = require("bcryptjs")
const utilities = require("../utilities")
const accountModel = require("../models/account-model")

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  const messages = req.flash()
  res.render("account/login", {
    title: "Login",
    nav,
    messages,
    errors: null,
    account_email: ""
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  const messages = req.flash()
  res.render("account/register", {
    title: "Register",
    nav,
    messages,
    errors: null,
    account_firstname: "",
    account_lastname: "",
    account_email: ""
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // Hash the plain text password with 10 salt rounds
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("error", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      messages: req.flash(),
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    })
  }

  // Call the model with hashedPassword - same file
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult?.rows?.length > 0) {
    req.flash("success", `Congratulations, you're registered ${account_firstname}. Please log in.`)
    res.status(201).redirect("/account/login")
  } else {
    req.flash("error", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      messages: req.flash(),
      errors: null,
      first_name: account_firstname,
      last_name: account_lastname,
      email: account_email
    })
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount
}
