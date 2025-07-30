const { body, validationResult } = require("express-validator")
const utilities = require("../utilities/")

/* =========================
   VALIDATION RULES
========================= */

// For adding classification
const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .isAlphanumeric()
      .withMessage("Classification name must be alphanumeric with no spaces or special characters."),
  ]
}

// For adding inventory
const inventoryRules = () => {
  return [
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Enter a valid year."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a non-negative integer."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
    body("classification_id").isInt({ gt: 0 }).withMessage("Classification is required."),
  ]
}

/* =========================
   CHECK FUNCTIONS
========================= */

// Check classification form data
const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name,
    })
  }
  next()
}

/* ******************************
 * Check inventory data
 * ******************************/
const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const { 
    inv_make, inv_model, inv_year, inv_description, 
    inv_image, inv_thumbnail, inv_price, 
    inv_miles, inv_color, classification_id 
  } = req.body

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)

    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
    return
  }
  next()
}


module.exports = {
  classificationRules,
  inventoryRules,
  checkClassificationData,
  checkInventoryData,
}
