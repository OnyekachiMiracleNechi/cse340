// Require dependencies
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const invController = require("../controllers/invController")
const validate = require("../utilities/account-validation") // For account
const accountValidate = require("../utilities/account-validation") // for account validate
const invValidate = require("../utilities/inventory-validation") // For inventory

// Account views
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Account management view (protected by login check)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))



// Inventory views
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Route to deliver Update Account Information view
router.get(
  "/update/:account_id",
  utilities.checkLogin, // Must be logged in
  utilities.handleErrors(accountController.buildUpdateAccountView)
)


// Logout - Clears JWT cookie & destroys session
router.get("/logout", accountController.logoutAccount)



// Process registration
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process login
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Add Classification
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  utilities.handleErrors(invController.addClassification)
)

// Add Inventory
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// POST update account info
router.post(
  "/update",
  utilities.checkLogin,
  accountValidate.accountUpdateRules(), // server-side validation
  accountValidate.checkUpdateData,     // validation error handler
  utilities.handleErrors(accountController.updateAccount)
)

// POST update password
router.post(
  "/update-password",
  utilities.checkLogin,
  accountValidate.passwordRules(),    // server-side validation
  accountValidate.checkPasswordData, // validation error handler
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router
