const express = require("express")
const router = express.Router()
const favoritesController = require("../controllers/favoritesController")
const utilities = require("../utilities/")

// View all favorites for logged-in user
router.get("/", 
  utilities.checkLogin, 
  favoritesController.buildFavorites
)

// Add a favorite
router.post("/add/:invId", 
  utilities.checkLogin, 
  favoritesController.addFavorite
)

// Remove a favorite
router.post("/remove/:invId", 
  utilities.checkLogin, 
  favoritesController.removeFavorite
)

module.exports = router
