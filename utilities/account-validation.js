const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/* ***************************
 *  Registration validation rules
 * *************************** */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ***************************
 *  Check registration data
 * *************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Registration",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ***************************
 *  Login validation rules
 * *************************** */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty.")
  ]
}

/* ***************************
 *  Check login data
 * *************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let nav = await utilities.getNav()
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email
    })
  }
  next()
}

/* ***************************
 *  Account info update rules
 * *************************** */
validate.accountUpdateRules = () => {
  return [
    body("account_firstname").trim().isLength({ min: 1 }).withMessage("First name is required."),
    body("account_lastname").trim().isLength({ min: 1 }).withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail().withMessage("Valid email is required.")
      .custom(async (email, { req }) => {
        const account = await accountModel.getAccountByEmail(email)
        if (account && account.account_id != req.body.account_id) {
          throw new Error("Email already in use.")
        }
      })
  ]
}

/* ***************************
 *  Password change rules
 * *************************** */
validate.passwordRules = () => {
  return [
    body("account_password")
      .isStrongPassword({ minLength: 12 })
      .withMessage("Password must be at least 12 characters and include uppercase, lowercase, number, and special character.")
  ]
}

/* ***************************
 *  Check update account data
 * *************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email
    })
  }
  next()
}

/* ***************************
 *  Check password change data
 * *************************** */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      account_id: req.body.account_id
    })
  }
  next()
}

module.exports = validate
