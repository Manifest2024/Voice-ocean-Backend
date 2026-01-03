const connection = require("../db.js");
const fs = require("fs");
const shortUUID = require("short-uuid");
const { createReadStream } = require("fs");
const { pipeline } = require("stream");
const { v4: uuidv4 } = require("uuid");

exports.addBlog = (req, res) => {
  const { title, content, meta_title, meta_description } = req.body;
  const blogImage = req.file;

  if (!title || !content || !blogImage) {
    return res.status(400).json("Title, content, or image is missing");
  }

  const imageId = uuidv4();
  const ext = blogImage.originalname.split(".").pop();
  const imagePath = `blog_images/${imageId}.${ext}`;

  fs.rename(blogImage.path, imagePath, (err) => {
    if (err) {
      return res.status(500).json("Error saving blog image");
    }

    const sql = `
      INSERT INTO blogs (title, meta_title, meta_description, image, content)
      VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(
      sql,
      [title, meta_title, meta_description, imagePath, content],
      (err) => {
        if (err) {
          return res.status(500).json("Error adding blog");
        }
        res.status(200).json({ message: "Blog added successfully" });
      }
    );
  });
};


// get all blogs
exports.getAllBlogs = (req, res) => {
  const sql = "SELECT * FROM blogs";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching blogs:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching blogs from the database" });
      return;
    }

    // Modify results to include the full URL for the image path
    const modifiedResults = results.map((result) => ({
      ...result,
      image: `https://${req.get("host")}/${result.image}`,
    }));

    res.status(200).json(modifiedResults);
  });
};


// DELETE endpoint to delete a blog by ID
exports.deleteBlog = (req, res) => {
  const { id } = req.params;

  // Query to fetch the blog's image path
  const fetchImageQuery = "SELECT image FROM blogs WHERE id = ?";
  connection.query(fetchImageQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching blog image path:", err);
      res.status(500).json({ error: "An error occurred while fetching blog data" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }

    const imagePath = results[0].image;

    // Query to delete the blog from the database
    const deleteBlogQuery = "DELETE FROM blogs WHERE id = ?";
    connection.query(deleteBlogQuery, [id], (err, result) => {
      if (err) {
        console.error("Error deleting blog:", err);
        res.status(500).json({ error: "An error occurred while deleting the blog" });
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).json({ error: "Blog not found" });
        return;
      }

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image file:", err);
          res.status(500).json({ error: "Error deleting blog image file" });
          return;
        }

        console.log("Blog and image deleted successfully");
        res.status(200).json({ message: "Blog deleted successfully" });
      });
    });
  });
};


exports.updateBlog = (req, res) => {
  const { id } = req.params;
  const { title, content, meta_title, meta_description } = req.body;
  const blogImage = req.file;

  const fetchBlogQuery = "SELECT * FROM blogs WHERE id = ?";
  connection.query(fetchBlogQuery, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const currentBlog = results[0];
    let imagePath = currentBlog.image;

    if (blogImage) {
      const ext = blogImage.originalname.split(".").pop();
      imagePath = `blog_images/${uuidv4()}.${ext}`;

      pipeline(
        fs.createReadStream(blogImage.path),
        fs.createWriteStream(imagePath),
        () => {
          if (currentBlog.image) fs.unlink(currentBlog.image, () => {});
        }
      );
    }

    const sql = `
      UPDATE blogs SET
        title = ?,
        meta_title = ?,
        meta_description = ?,
        content = ?,
        image = ?
      WHERE id = ?
    `;

    connection.query(
      sql,
      [title, meta_title, meta_description, content, imagePath, id],
      (err) => {
        if (err) {
          return res.status(500).json("Error updating blog");
        }
        res.status(200).json({ message: "Blog updated successfully" });
      }
    );
  });
};


exports.getBlogById = (req, res) => {
  const { id } = req.params; // Blog ID from the URL

  // Query to fetch the blog by ID
  const fetchBlogQuery = "SELECT * FROM blogs WHERE id = ?";
  connection.query(fetchBlogQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching blog:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the blog" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }

    const blog = results[0];

    // Modify the image path to include the host and protocol
    blog.image = `https://${req.get("host")}/${blog.image}`;

    res.status(200).json(blog);
  });
};






