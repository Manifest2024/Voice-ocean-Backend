const connection = require("../db.js");
const shortUUID = require("short-uuid");

exports.addTestimonials = (req, res) => {
  const { seo_title, testimonial_name, location, testimonial_description } = req.body;

  if (!testimonial_name || !location || !testimonial_description) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const image = req.file
    ? `testimonial_images/${req.file.filename}`
    : null;

  const testimonialId = shortUUID.generate();

  const sql = `
    INSERT INTO testimonials
    (testimonial_id, seo_title, testimonial_name, location, testimonial_description, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [
      testimonialId,
      seo_title || null,
      testimonial_name,
      location,
      testimonial_description,
      image,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error inserting testimonial" });
      }

      res.status(201).json({ message: "Testimonial added successfully" });
    }
  );
};





exports.updateTestimonial = (req, res) => {
  const { testimonialId } = req.params;

  const fields = [
    "seo_title",
    "testimonial_name",
    "location",
    "testimonial_description",
  ];

  const fieldsToUpdate = [];
  const params = [];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  });

  if (req.file) {
    fieldsToUpdate.push("image = ?");
    params.push(`testimonial_images/${req.file.filename}`);
  }

  if (!fieldsToUpdate.length) {
    return res.status(400).json({ error: "No fields to update" });
  }

  params.push(testimonialId);

  const sql = `
    UPDATE testimonials
    SET ${fieldsToUpdate.join(", ")}
    WHERE testimonial_id = ?
  `;

  connection.query(sql, params, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error updating testimonial" });
    }

    res.status(200).json({ message: "Testimonial updated successfully" });
  });
};




exports.getAllTestimonials = (req, res) => {
  const sql = "SELECT * FROM testimonials";

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json("DB error");

    const data = results.map((t) => ({
      ...t,
      image: t.image ? `https://${req.get("host")}/${t.image}` : null,
    }));

    res.status(200).json(data);
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
