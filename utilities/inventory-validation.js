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

// public/js/inventory-validation.js

function isEmpty(value) {
  return value.trim() === "";
}

function isPositiveNumber(value) {
  return !isNaN(value) && Number(value) > 0;
}

function isValidYear(value) {
  const year = Number(value);
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
}

function attachInventoryFormValidation() {
  const form = document.getElementById("addInventoryForm");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    let errors = [];

    const make = document.getElementById("inv_make").value;
    const model = document.getElementById("inv_model").value;
    const year = document.getElementById("inv_year").value;
    const desc = document.getElementById("inv_description").value;
    const image = document.getElementById("inv_image").value;
    const thumb = document.getElementById("inv_thumbnail").value;
    const price = document.getElementById("inv_price").value;
    const miles = document.getElementById("inv_miles").value;
    const color = document.getElementById("inv_color").value;

    if (isEmpty(make)) errors.push("Make is required.");
    if (isEmpty(model)) errors.push("Model is required.");
    if (!isValidYear(year)) errors.push("Enter a valid year between 1900 and next year.");
    if (isEmpty(desc)) errors.push("Description is required.");
    if (isEmpty(image)) errors.push("Image path is required.");
    if (isEmpty(thumb)) errors.push("Thumbnail path is required.");
    if (!isPositiveNumber(price)) errors.push("Price must be a positive number.");
    if (!isPositiveNumber(miles)) errors.push("Miles must be a positive number.");
    if (isEmpty(color)) errors.push("Color is required.");

    if (errors.length > 0) {
      event.preventDefault();

      // Remove old errors
      const oldList = document.querySelector(".client-errors");
      if (oldList) oldList.remove();

      // Add new error list
      const ul = document.createElement("ul");
      ul.classList.add("client-errors");
      ul.style.color = "red";
      errors.forEach(err => {
        const li = document.createElement("li");
        li.textContent = err;
        ul.appendChild(li);
      });

      form.parentNode.insertBefore(ul, form);
    }
  });
}




module.exports = {
  classificationRules,
  inventoryRules,
  checkClassificationData,
  checkInventoryData,
}
