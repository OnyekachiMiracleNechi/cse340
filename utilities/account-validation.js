const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const validate = {}


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
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists){
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


validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Registration",
      nav,
      errors,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

// Login validation rules
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

// Check login data and return errors
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let nav = await utilities.getNav()
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: account_email
    })
  }
  next()
}



module.exports = validate
