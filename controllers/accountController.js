/* Require utilities */
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
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


/* ***************************
 *  Deliver Account Management View
 * *************************** */
async function buildAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_id, account_type } = res.locals.accountData

  const messages = req.flash() // ✅ fetch all flash messages

  res.render("account/management", {
    title: "Account Management",
    nav,
    messages, // ✅ pass to view
    notice: messages.notice || [], // ✅ also pass notice array
    errors: null,
    account_firstname,
    account_id,
    account_type
  })
}


/* ***************************
 *  Deliver Update Account Information View
 *  Pre-fills form with current account data
 * *************************** */
async function buildUpdateAccountView(req, res) {
  const nav = await utilities.getNav()
  const messages = req.flash() // ✅ Capture any flash messages
  const account_id = parseInt(req.params.account_id)

  if (isNaN(account_id)) {
    req.flash("error", "Invalid account ID.")
    return res.redirect("/account/")
  }

  // Get account data from the model
  const accountData = await accountModel.getAccountById(account_id)

  if (!accountData) {
    req.flash("error", "Account not found.")
    return res.redirect("/account/")
  }

  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    messages, // ✅ Pass flash messages to the view
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
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



/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}


/* ***************************
 *  Process Account Info Update
 * *************************** */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  // Run the update
  const updateResult = await accountModel.updateAccountInfo(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    //  Set success message for next request
    req.flash("success", "Account information updated successfully.")

    //  Redirect to account management page so flash message will show
    return res.redirect("/account/")
  } else {
    //  Failed update
    req.flash("notice", "Sorry, the update failed.")
    return res.redirect(`/account/update/${account_id}`)
  }
}


/* ***************************
 *  Process Password Change
 * *************************** */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10)

    // Update in DB
    const updateResult = await accountModel.updateAccountPassword(account_id, hashedPassword)

    if (updateResult) {
      // Set success message
      req.flash("success", "Password updated successfully.")

      //  Redirect to account management so flash message is displayed
      return res.redirect("/account/")
    } else {
      //  Update failed
      req.flash("notice", "Password update failed.")
      return res.redirect(`/account/update/${account_id}`)
    }
  } catch (error) {
    console.error(error)
    req.flash("notice", "Error updating password.")
    return res.redirect(`/account/update/${account_id}`)
  }
}



/* ***************************
 *  Logout Account
 * *************************** */
async function logoutAccount(req, res) {
  res.clearCookie("jwt")       // Delete JWT cookie
  req.session.destroy(() => {  // Destroy session
    res.redirect("/")          // Go back to homepage
  })
}


module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccount,
  buildUpdateAccountView,
  updateAccount,
  updatePassword,
  logoutAccount
}
