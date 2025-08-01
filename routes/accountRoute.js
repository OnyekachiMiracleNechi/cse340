// Require dependencies
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const invController = require("../controllers/invController")
const validate = require("../utilities/account-validation")      // For account
const invValidate = require("../utilities/inventory-validation") // For inventory

// Account views
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Account management view (protected by login check)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))



// Inventory views
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))


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

module.exports = router
