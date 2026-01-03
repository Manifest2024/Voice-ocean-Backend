const connection = require("../db.js");
const fs = require("fs");
const shortUUID = require("short-uuid");

exports.uploadClientImage = (req, res) => {
  const { seo_title } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    res.status(400).json("client logo file is missing");
    return;
  }

  const imageFileName = imageFile.filename;
  const imagePath = `client_images/${imageFileName}`;

  const clientId = shortUUID.generate();

  // Move the uploaded file to the client_images folder
  fs.rename(imageFile.path, imagePath, (err) => {
    if (err) {
      console.error("Error moving image file:", err);
      res.status(500).json("Error uploading client image");
      return;
    }

    // Insert the client information into the database
    const insertClientQuery =
      "INSERT INTO clients (client_id,seo_title, client_logo) VALUES (?, ?,?)";
    connection.query(
      insertClientQuery,
      [clientId, seo_title, imagePath],
      (err, result) => {
        if (err) {
          console.error("Error adding client image:", err);
          res.status(500).json("Error adding client image");
          return;
        }
        console.log("Client image added successfully");
        res.status(200).json("Client image added successfully");
      }
    );
  });
};


// GET endpoint to fetch all clients
exports.getAllClients = (req, res) => {
  const sql = 'SELECT * FROM clients';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching clients:', err);
      res.status(500).json({ error: 'An error occurred while fetching clients from the database' });
      return;
    }
    
    const modifiedResults = results.map((result) => ({
      ...result,
      client_logo: `https://${req.get("host")}/${result.client_logo}`,
    }));

    res.status(200).json(modifiedResults);
  });
};

// DELETE endpoint to delete a client by client_id
exports.deleteClient = (req, res) => {
  const { clientId } = req.params;

  if (!clientId) {
    res.status(400).json({ error: 'Client ID is missing' });
    return;
  }

  const sql = 'DELETE FROM clients WHERE client_id = ?';

  connection.query(sql, clientId, (err, result) => {
    if (err) {
      console.error('Error deleting client:', err);
      res.status(500).json({ error: 'An error occurred while deleting client from the database' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    console.log('Client deleted successfully');
    res.status(200).json({ message: 'Client deleted successfully' });
  });
};

