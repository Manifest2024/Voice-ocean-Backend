const nodemailer = require("nodemailer");
const shortUUID = require("short-uuid");
const connection = require("../db.js");

const EMAIL_PASSWORD = "fqasqvltcfyjlrta";
const EMAIL_USER = "ashishkap9@gmail.com";

exports.dashboardAPI = (req, res) => {
  // Query to get total number of voice samples
  connection.query(
    "SELECT COUNT(*) AS voice_sample_count FROM voice_samples",
    (err, voiceSamplesResult) => {
      if (err) {
        console.error("Error fetching voice sample count:", err);
        res.status(500).send("Error fetching voice sample count");
        return;
      }

      // Query to get total number of quotations
      connection.query(
        "SELECT COUNT(*) AS quotation_count FROM quotations",
        (err, quotationsResult) => {
          if (err) {
            console.error("Error fetching quotation count:", err);
            res.status(500).send("Error fetching quotation count");
            return;
          }

          // Query to get total number of artists
          connection.query(
            "SELECT COUNT(*) AS artist_count FROM artists",
            (err, artistsResult) => {
              if (err) {
                console.error("Error fetching artist count:", err);
                res.status(500).send("Error fetching artist count");
                return;
              }

              // Query to get status count of quotations
              connection.query(
                "SELECT status, COUNT(*) AS count FROM quotations GROUP BY status",
                (err, statusResult) => {
                  if (err) {
                    console.error("Error fetching status count:", err);
                    res.status(500).send("Error fetching status count");
                    return;
                  }

                  // Combine all results into a single object
                  const data = {
                    voiceSampleCount: voiceSamplesResult[0].voice_sample_count,
                    quotationCount: quotationsResult[0].quotation_count,
                    artistCount: artistsResult[0].artist_count,
                    statusCount: statusResult.reduce((acc, curr) => {
                      acc[curr.status] = curr.count;
                      return acc;
                    }, {}),
                  };

                  // Send the data as JSON response
                  res.json([data]);
                }
              );
            }
          );
        }
      );
    }
  );
};

exports.getAllQuotations = (req, res) => {
  let {
    page = 1,
    limit,
    sortBy = "id",
    sortOrder = "ASC",
    artistName,
  } = req.query;

  if (!limit) {
    limit = 10;
  }

  const offset = (page - 1) * limit;
  
  // Build the base SQL query
  let sql = "SELECT * FROM quotations";

  // Filter by artist name if provided
  if (artistName) {
    sql += ` WHERE artist_name LIKE '%${artistName}%'`;
  }

  // Add sorting and pagination
  sql += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching quotations:", err);
      res.status(500).json("Error fetching quotations");
      return;
    }
    res.status(200).json(results);
  });
};

exports.updateQuotation = (req, res) => {
  const { quotationId } = req.params;
  const fields = [
    "language",
    "style",
    "script",
    "category",
    "instruction",
    "email",
    "artist_demo",
    "status",
  ];

  if (!quotationId) {
    res.status(400).send("Quotation ID is missing.");
    return;
  }

  if (
    req.body.status &&
    req.body.status !== "OPEN" &&
    req.body.status !== "IN PROGRESS" &&
    req.body.status !== "COMPLETED"
  ) {
    res
      .status(400)
      .send(
        "Wrong status field value. It must be 'OPEN' or 'IN PROGRESS' or 'COMPLETED'."
      );
    return;
  }

  const fieldsToUpdate = [];
  const params = [];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  });

  if (fieldsToUpdate.length === 0) {
    res.status(400).send("No fields to update.");
    return;
  }

  params.push(quotationId);
  const setClause = fieldsToUpdate.join(", ");
  const sql = `UPDATE quotations SET ${setClause} WHERE id = ?`;

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating quotation:", err);
      res.status(500).send("Error updating quotation");
      return;
    }
    console.log("Quotation updated successfully");
    res.status(200).send("Quotation updated successfully");
  });
};

exports.addQuotation = async (req, res) => {
  const {
    language,
    style,
    script,
    category,
    instruction,
    email,
    artist_demo,
    status,
    artistId,
  } = req.body;

  const quotationStatus = status || "OPEN";

  if (
    status &&
    status !== "OPEN" &&
    status !== "IN PROGRESS" &&
    status !== "COMPLETED"
  ) {
    res
      .status(400)
      .send(
        "Wrong status field value. It must be 'OPEN' or 'IN PROGRESS' or 'COMPLETED'."
      );
    return;
  }

  console.log(quotationStatus);

  const requiredFields = [
    "artistId",
    "email",
    "style",
    "script",
    "language",
    "category",
  ];

  if (requiredFields.some((field) => !req.body[field])) {
    return res
      .status(400)
      .send("Required fields are missing: " + requiredFields.join(", "));
  }

  try {
    const [artist] = await connection
      .promise()
      .query("SELECT name FROM artists WHERE id = ?", [artistId]);

    if (!artist || !artist.length) {
      return res.status(400).send("Artist ID does not exist");
    }

    const artistName = artist[0].name;
    console.log(artist);

    const quotationId = shortUUID.generate();

    await connection
      .promise()
      .query(
        "INSERT INTO quotations (id, language, style, script, category, instruction, email, artist_demo, status, artist_id, artist_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          quotationId,
          language,
          style,
          script,
          category,
          instruction,
          email,
          artist_demo,
          quotationStatus,
          artistId,
          artistName,
        ]
      );

    sendEmail(
      email,
      language,
      style,
      script,
      category,
      instruction,
      artist_demo,
      artistName
    );

    console.log("Quotation added successfully");
    return res.status(200).send("Quotation added successfully");
  } catch (error) {
    console.error("Error adding quotation:", error);
    return res.status(500).send("Error adding quotation");
  }
};

function sendEmail(
  email,
  language,
  style,
  script,
  category,
  instruction,
  artist_demo,
  artistName
) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: EMAIL_USER,
    to: EMAIL_USER,
    subject: "Quotation Details",
    html: `
      <p><strong>Client Email Id:</strong> ${email}</p>
      <h2>Quotation Details</h2>
      <p><strong>Artist Name:</strong> ${artistName}</p>
      <p><strong>Language:</strong> ${language}</p>
      <p><strong>Style:</strong> ${style}</p>
      <p><strong>Script:</strong> ${script}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Instruction:</strong> ${instruction}</p>
      <p><strong>Artist Demo:</strong> ${artist_demo}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

exports.deleteOrder = (req, res) => {
  const orderId = req.params.orderId;

  if (!orderId) {
    res.status(400).json("order ID is missing");
    return;
  }

  const deleteorderQuery = "DELETE FROM quotations WHERE id = ?";

  connection.query(deleteorderQuery, [orderId], (err, result) => {
    if (err) {
      console.error("Error deleting quotation order:", err);
      res.status(500).json("Error deleting quotation order");
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json("quotation order not found");
      return;
    }

    console.log("quotation order deleted successfully");
    res.status(200).json("quotation order deleted successfully");
  });
};

exports.contactUsAPI = (req, res) => {
  const { name, email, phone_number, service_type, subject, message } =
    req.body;

  const requiredFields = [
    "name",
    "email",
    "phone_number",
    "service_type",
    "subject",
    "message",
  ];

  if (requiredFields.some((field) => !req.body[field])) {
    return res
      .status(400)
      .send("Required fields are missing: " + requiredFields.join(", "));
  }
  // Insert into the contacts table
  connection.query(
    "INSERT INTO contacts (name, email, phone_number, service_type, subject, message) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, phone_number, service_type, subject, message],
    (error, results, fields) => {
      if (error) {
        console.error("Error inserting into database:", error);
        return res
          .status(500)
          .json({ error: "An error occurred while processing your request." });
      }
      res
        .status(201)
        .json({ message: "Contact information successfully saved." });
    }
  );
};
