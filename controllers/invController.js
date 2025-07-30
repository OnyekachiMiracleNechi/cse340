const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")

const invController = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invController.buildDetailView = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id
    const vehicle = await invModel.getVehicleById(inv_id)

    if (!vehicle) {
      throw new Error("Vehicle not found")
    }

    const nav = await utilities.getNav()

    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
    })
  } catch (error) {
    console.error("Error building vehicle detail view:", error)
    next(error)
  }
}

/* ***************************
 *  ✅ Inventory management view
 * ************************** */
invController.buildManagementView = async function (req, res) {
  let nav = await utilities.getNav()
  const messages = req.flash()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages,
  })
}



// Show add-classification form
invController.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: "", // sticky default
  })
}

// Process classification form
invController.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      classification_name, // sticky input
    })
  }

  try {
    await invModel.addClassification(classification_name)
    req.flash("notice", "Classification added successfully.")
    res.redirect("/inv")
  } catch (error) {
    req.flash("notice", "Sorry, there was an error adding the classification.")
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      classification_name,
    })
    
  }
}


// build inventory add form
invController.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    messages: req.flash(),
    errors: null,
  })
}







/* ***************************
 *  Process Add Inventory Form
 * ************************** */

invController.addInventory = async function (req, res) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  try {
    const result = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    )

    if (result) {
      req.flash("success", "Inventory added successfully.")
      res.redirect("/inv/")
    } else {
      throw new Error("Failed to insert inventory.")
    }
  } catch (error) {
    console.error("Add Inventory Error:", error)
    const classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("error", "An error occurred while adding inventory.")
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      errors: [{ msg: error.message }]
    })
  }
}




module.exports = invController
