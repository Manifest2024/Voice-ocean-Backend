const connection = require("../db.js");
const fs = require("fs");
const shortUUID = require("short-uuid");
const { createReadStream } = require("fs");
const { pipeline } = require("stream");
const { v4: uuidv4 } = require("uuid");

exports.addBlog = (req, res) => {
  const { title, content } = req.body;
  const blogImage = req.file; // Assuming you use multer for file uploads

  // Validate required fields
  if (!title || !content || !blogImage) {
    res.status(400).json("Title, content, or image is missing");
    return;
  }

  const imageId = uuidv4(); // Unique ID for the image
  const ext = blogImage.originalname.split(".").pop(); // Get file extension
  const imagePath = `blog_images/${imageId}.${ext}`; // Target file path

  // Move the uploaded file to the target folder
  fs.rename(blogImage.path, imagePath, (err) => {
    if (err) {
      console.error("Error moving blog image:", err);
      res.status(500).json("Error saving blog image");
      return;
    }

    // Insert the blog data into the database
    const insertBlogQuery =
      "INSERT INTO blogs (title, image, content) VALUES (?, ?, ?)";
    connection.query(
      insertBlogQuery,
      [title, imagePath, content],
      (err, result) => {
        if (err) {
          console.error("Error adding blog:", err);
          res.status(500).json("Error adding blog");
          return;
        }

        console.log("Blog added successfully");
        res.status(200).json("Blog added successfully");
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
      image: `${req.protocol}://${req.get("host")}/${result.image}`,
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
  const { title, content } = req.body; 
  const blogImage = req.file;

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

    const currentBlog = results[0];
    let imagePath = currentBlog.image; 

    if (blogImage) {
      const ext = blogImage.originalname.split(".").pop(); // Get file extension
      imagePath = `blog_images/${uuidv4()}.${ext}`; // New image path

      // Replace the old image file with the new one
      pipeline(
        fs.createReadStream(blogImage.path),
        fs.createWriteStream(imagePath),
        (err) => {
          if (err) {
            console.error("Error saving blog image:", err);
            res.status(500).json({ error: "Error saving blog image" });
            return;
          }

          // Delete the old image file
          if (currentBlog.image) {
            fs.unlink(currentBlog.image, (err) => {
              if (err) {
                console.error("Error deleting old image file:", err);
              }
            });
          }
        }
      );
    }

    // Update the blog information in the database
    let updateBlogQuery = "UPDATE blogs SET ";
    const queryParams = [];
    if (title) {
      updateBlogQuery += "title = ?, ";
      queryParams.push(title);
    }
    if (content) {
      updateBlogQuery += "content = ?, ";
      queryParams.push(content);
    }
    if (blogImage) {
      updateBlogQuery += "image = ?, ";
      queryParams.push(imagePath);
    }

    // Remove the trailing comma and space
    updateBlogQuery = updateBlogQuery.slice(0, -2);
    updateBlogQuery += " WHERE id = ?";
    queryParams.push(id);

    connection.query(updateBlogQuery, queryParams, (err, result) => {
      if (err) {
        console.error("Error updating blog:", err);
        res
          .status(500)
          .json({ error: "An error occurred while updating the blog" });
        return;
      }

      res.status(200).json({ message: "Blog updated successfully" });
    });
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
    blog.image = `${req.protocol}://${req.get("host")}/${blog.image}`;

    res.status(200).json(blog);
  });
};






