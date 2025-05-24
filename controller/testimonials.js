const connection = require("../db.js");
const shortUUID = require("short-uuid");

exports.addTestimonials = (req, res) => {
  const { seo_title, testimonial_name, location, testimonial_description } =
    req.body;
  if (!testimonial_name || !location || !testimonial_description) {
    return res
      .status(400)
      .json(
        "some fields are missing - testimonial_name, location, testimonial_description "
      );
  }

  const testimonialId = shortUUID.generate();
  const sql =
    "INSERT INTO testimonials (testimonial_id,seo_title, testimonial_name, location, testimonial_description) VALUES (?, ?, ?, ?,?)";
  const values = [
    testimonialId,
    seo_title,
    testimonial_name,
    location,
    testimonial_description,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data: " + err);
      res
        .status(500)
        .json({
          error: "An error occurred while inserting data into the database",
        });
      return;
    }

    console.log("Data inserted successfully:", result);
    res.status(201).json({ message: "Data inserted successfully" });
  });
};



exports.updateTestimonial = (req, res) => {
  const { testimonialId } = req.params;
  const fields = [
    "seo_title",
    "testimonial_name",
    "location",
    "testimonial_description",
  ];

  if (!testimonialId) {
    res.status(400).send("Testimonial ID is missing.");
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

  params.push(testimonialId);
  const setClause = fieldsToUpdate.join(", ");
  const sql = `UPDATE testimonials SET ${setClause} WHERE testimonial_id = ?`;

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating testimonial:", err);
      res.status(500).send("Error updating testimonial");
      return;
    }
    console.log("Testimonial updated successfully");
    res.status(200).send("Testimonial updated successfully");
  });
};


exports.getAllTestimonials = (req, res) => {
    const sql = 'SELECT * FROM testimonials';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data: ' + err);
            res.status(500).json({ error: 'An error occurred while fetching data from the database' });
            return;
        }

        console.log('Data fetched successfully');
        res.status(200).json(results);
    });
};

exports.deleteTestimonials = (req, res) => {
    const { testimonialId } = req.params;

    const sql = 'DELETE FROM testimonials WHERE testimonial_id = ?';

    connection.query(sql, testimonialId, (err, result) => {
        if (err) {
            console.error('Error deleting data: ' + err);
            res.status(500).json({ error: 'An error occurred while deleting data from the database' });
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Testimonial not found' });
            return;
        }

        console.log('Data deleted successfully');
        res.status(200).json({ message: 'Data deleted successfully' });
    });
};
