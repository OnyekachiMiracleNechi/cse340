const favoritesModel = require("../models/favorites-model")
const utilities = require("../utilities/")

/* =========================
   Build favorites page
========================= */
async function buildFavorites(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const favorites = await favoritesModel.getFavoritesByAccountId(account_id)
    let nav = await utilities.getNav()

    // ✅ Read flash messages once
    const successMsg = req.flash("success")[0] || null
    const errorMsg = req.flash("error")[0] || null

    res.render("favorites/favorites", {
      title: "My Favorites",
      nav,
      errors: null,
      favorites,
      success: successMsg,
      errorMessage: errorMsg
    })
  } catch (error) {
    next(error)
  }
}

/* =========================
   Add favorite
========================= */
async function addFavorite(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const inv_id = parseInt(req.params.invId)

    const added = await favoritesModel.addFavorite(account_id, inv_id)

    if (added) {
      // ✅ Set success message before redirect
      req.flash("success", "✅ Successfully added to favorites!")
    } else {
      // ✅ Set error message before redirect
      req.flash("error", "⚠ This item is already in your favorites.")
    }

    // ✅ Redirect to detail page (messages will be read in buildDetailView)
    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    next(error)
  }
}

/* =========================
   Remove favorite
========================= */
async function removeFavorite(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const inv_id = parseInt(req.params.invId)

    await favoritesModel.removeFavorite(account_id, inv_id)
    req.flash("success", "❌ Item removed from favorites.")

    // ✅ Redirect back to favorites page
    res.redirect("/account/favorites")
  } catch (error) {
    next(error)
  }
}

module.exports = { buildFavorites, addFavorite, removeFavorite }
