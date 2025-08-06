const pool = require("../database/")

/* Get favorites for a user */
async function getFavoritesByAccountId(account_id) {
  try {
    const sql = `
      SELECT f.favorite_id, i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_image
      FROM favorites f
      JOIN inventory i ON f.inv_id = i.inv_id
      WHERE f.account_id = $1
      ORDER BY f.date_added DESC
    `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getFavoritesByAccountId error:", error)
    throw error
  }
}

/* Add to favorites */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id)
      VALUES ($1, $2)
      ON CONFLICT (account_id, inv_id) DO NOTHING
      RETURNING *
    `
    const result = await pool.query(sql, [account_id, inv_id])

    // ✅ Return true if inserted, false if it already existed
    return result.rowCount > 0
  } catch (error) {
    console.error("addFavorite error:", error)
    throw error
  }
}

/* Remove from favorites */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `
      DELETE FROM favorites
      WHERE account_id = $1 AND inv_id = $2
    `
    await pool.query(sql, [account_id, inv_id])
    return true
  } catch (error) {
    console.error("removeFavorite error:", error)
    throw error
  }
}

module.exports = { getFavoritesByAccountId, addFavorite, removeFavorite }
