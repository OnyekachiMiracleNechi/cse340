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

// Route to build the add inventory view
router.get("/add-inventory", invController.buildAddInventory)

// Route to get inventory data by classification_id in JSON format
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to display the edit inventory form
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
)


// POST route to add a new classification
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)



// ✅ POST route to process new inventory submission
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Update inventory item
router.post(
  "/update",
  invValidate.inventoryRules(), // if you are using validation
  invValidate.checkInventoryData,  // validation error handler
  utilities.handleErrors(invController.updateInventory)
)



module.exports = router
