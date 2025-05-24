const connection = require("../db.js");
const shortUUID = require("short-uuid");

exports.addLanguage = (req, res) => {
  const { language, artistId,title } = req.body;

  if (!language || !artistId) {
    res.status(400).send("language or artistId is missing");
    return; // Return early to prevent further execution
  }

  // Generate unique language ID
  const languageId = shortUUID.generate();

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

    // If artistId exists, proceed with inserting language
    const insertLanguageQuery =
      "INSERT INTO languages (id, language, artist_id,title) VALUES (?, ?, ?,?)";
    connection.query(
      insertLanguageQuery,
      [languageId, language, artistId,title],
      (err, result) => {
        if (err) {
          console.error("Error adding language:", err);
          res.status(500).send("Error adding language");
          return;
        }
        console.log("Language added successfully");
        res.status(200).send("Language added successfully");
      }
    );
  });
};

// delete
exports.deleteLanguage = (req, res) => {
  const { languageId } = req.params;

  if (!languageId) {
    res.status(400).send("Language ID is missing.");
    return;
  }

  // Check if the language exists
  const checkLanguageQuery = "SELECT * FROM languages WHERE id = ?";
  connection.query(checkLanguageQuery, [languageId], (err, results) => {
    if (err) {
      console.error("Error checking language:", err);
      res.status(500).send("Error checking language");
      return;
    }

    if (results.length === 0) {
      res.status(404).send("Language not found.");
      return;
    }

    // Language exists, proceed with deletion
    const deleteLanguageQuery = "DELETE FROM languages WHERE id = ?";
    connection.query(deleteLanguageQuery, [languageId], (err, result) => {
      if (err) {
        console.error("Error deleting language:", err);
        res.status(500).send("Error deleting language");
        return;
      }
      console.log("Language deleted successfully");
      res.status(200).send("Language deleted successfully");
    });
  });
};
