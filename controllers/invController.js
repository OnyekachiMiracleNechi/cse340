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
    let vehicle = await invModel.getInventoryById(inv_id)

    // Handle case where the model returns an array
    if (Array.isArray(vehicle) && vehicle.length > 0) {
      vehicle = vehicle[0]
    }

    if (!vehicle || Object.keys(vehicle).length === 0) {
      throw new Error("Vehicle not found")
    }

    const nav = await utilities.getNav()

    // ✅ Get flash messages once (reading twice clears them)
    const successMsg = req.flash("success")[0] || null
    const errorMsg = req.flash("error")[0] || null
    const noticeMsg = req.flash("notice")[0] || null

    res.render("inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
      success: successMsg,
      error: errorMsg,
      notice: noticeMsg
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
  const classificationSelect = await utilities.buildClassificationList()
  const messages = req.flash()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages,
    classificationSelect,
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
      req.flash("notice", "Inventory added successfully.")
      res.redirect("/inv/")
    } else {
      throw new Error("Failed to insert inventory.")
    }
  } catch (error) {
    console.error("Add Inventory Error:", error)
    const classificationList = await utilities.buildClassificationList(inv_id)
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



/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invController.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invController.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}





invController.updateInventory = async function (req, res) {
  let nav = await utilities.getNav()
  console.log("Request body:", req.body)

  const parsedInvId = Array.isArray(req.body.inv_id)
    ? parseInt(req.body.inv_id[0])
    : parseInt(req.body.inv_id)

  console.log("Parsed inv_id:", parsedInvId)

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
    inv_color,
  } = req.body

  try {
    console.log("Calling updateInventory with:")
    console.log({
      parsedInvId,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    })

    const updateResult = await invModel.updateInventory(
      parsedInvId,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    if (updateResult) {
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", `The ${itemName} was successfully updated.`)
      return res.redirect("/inv/")
    } else {
      throw new Error("Update failed")
    }
  } catch (error) {
    console.error("❌ Update Inventory Error:" ,error.message)

    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`

    return res.status(500).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: [{ msg: error.message }],
      inv_id: parsedInvId,
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
    })
  }
}


/* ***************************
 *  Build Delete Confirmation View
 * ************************** */
invController.buildDeleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id) // Get inv_id from URL params
    let nav = await utilities.getNav() // Build navigation
    const itemData = await invModel.getInventoryById(inv_id) // Get item data from DB

    // Build item name for title
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("inventory/delete-confirm", {
      title: `Delete ${itemName}`,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    })
  } catch (error) {
    console.error("Error building delete view:", error)
    next(error)
  }
}


/* ***************************
 *  Delete Inventory Item
 * ************************** */
invController.deleteInventoryItem = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id) // Get inventory ID from form
    const deleteResult = await invModel.deleteInventoryItem(inv_id) // Call model to delete

    if (deleteResult.rowCount > 0) {
      // ✅ Delete successful
      req.flash("notice", "The vehicle was successfully deleted.")
      res.redirect("/inv/") // Redirect to inventory management
    } else {
      // ❌ Delete failed
      req.flash("notice", "Sorry, the delete failed.")
      res.redirect(`/inv/delete/${inv_id}`) // Redirect back to confirmation page
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    next(error)
  }
}




module.exports = invController
