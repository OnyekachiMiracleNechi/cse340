// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation") // validation rules
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to build vehicle detail view
router.get("/detail/:inv_id", invController.buildDetailView)

// Route to render the inventory management view
router.get("/", invController.buildManagementView)

// Route to build the add classification view
router.get("/add-classification", invController.buildAddClassification)

// POST route to add a new classification
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Route to build the add inventory view
router.get("/add-inventory", invController.buildAddInventory)

// ✅ POST route to process new inventory submission
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)


module.exports = router
