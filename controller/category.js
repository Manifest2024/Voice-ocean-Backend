//  add category
const connection = require("../db.js");
const shortUUID = require("short-uuid");

exports.addCategory = (req, res) => {
  const { category, artistId, title } = req.body;

  if (!category || !artistId) {
    res.status(400).send("category or artistId is missing");
    return; // Return early to prevent further execution
  }

  // Generate unique category ID
  const categoryId = shortUUID.generate();

  // Check if artistId exists in artists table
  const artistCheckQuery = "SELECT id FROM artists WHERE id = ?";
  connection.query(artistCheckQuery, [artistId], (err, results) => {
    if (err) {
      console.error("Error checking artist:", err);
      res.status(500).send("Error checking artist");
      return;
    }

    if (results.length === 0) {
      // If artistId doesn't exist, send error response
      res.status(400).send("Artist ID does not exist");
      return;
    }

    // If artistId exists, proceed with inserting category
    const insertcategoryQuery =
      "INSERT INTO category (id,category,artist_id,title) VALUES (?,?,?,?)";
    connection.query(
      insertcategoryQuery,
      [categoryId, category, artistId, title],
      (err, result) => {
        if (err) {
          console.error("Error adding category:", err);
          res.status(500).send("Error adding category");
          return;
        }
        console.log("category added successfully");
        res.status(200).send("category added successfully");
      }
    );
  });
};

exports.deleteCategory = (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    res.status(400).send("Category ID is missing.");
    return;
  }

  // Check if the category exists
  const checkCategoryQuery = "SELECT * FROM category WHERE id = ?";
  connection.query(checkCategoryQuery, [categoryId], (err, results) => {
    if (err) {
      console.error("Error checking category:", err);
      res.status(500).send("Error checking category");
      return;
    }

    if (results.length === 0) {
      res.status(404).send("Category not found.");
      return;
    }

    // Category exists, proceed with deletion
    const deleteCategoryQuery = "DELETE FROM category WHERE id = ?";
    connection.query(deleteCategoryQuery, [categoryId], (err, result) => {
      if (err) {
        console.error("Error deleting category:", err);
        res.status(500).send("Error deleting category");
        return;
      }
      console.log("Category deleted successfully");
      res.status(200).send("Category deleted successfully");
    });
  });
};
