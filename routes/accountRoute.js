// Require dependencies
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const validate = require("../utilities/account-validation")

// Route to deliver the login and registration views
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration form
router.post(
  "/register",
  validate.registrationRules(),          // ✅ Fixed spelling
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt with validation
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Export the router
module.exports = router
