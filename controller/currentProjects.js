const connection = require("../db.js");
const shortUUID = require("short-uuid");
const moment = require("moment");

exports.addCurrentPoject = (req, res) => {
  const { seo_title, project_description } = req.body;
  if (!project_description) {
    return res.status(400).json("project description is required");
  }
  const project_date = new Date().toISOString().slice(0, 10);
  console.log(project_date); 
  const projectId = shortUUID.generate();
  const sql =
    "INSERT INTO current_projects (project_id,seo_title, project_date, project_description) VALUES (?, ?, ?,?)";
  const values = [projectId, seo_title, project_date, project_description];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data: " + err);
      res.status(500).json({
        error: "An error occurred while inserting data into the database",
      });
      return;
    }

    console.log("Data inserted successfully:", result);
    res.status(201).json({ message: "Data inserted successfully" });
  });
};


exports.getAllProjects = (req, res) => {
  const sql = "SELECT * FROM current_projects";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching projects:", err);
      res.status(500).send("Error fetching projects");
      return;
    }

   const modifiedResults = results.map((result) => {
     const date = new Date(result.project_date);
     const formattedDate = `${date.getFullYear()}/${String(
       date.getMonth() + 1
     ).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
     return {
       ...result,
       project_date: formattedDate,
     };
   });

    console.log("Projects fetched successfully");
    res.status(200).json(modifiedResults);
  });
};




// exports.updateProject = (req, res) => {
//   const { projectId } = req.params;
//   const fields = ["seo_title", "project_date", "project_description"];

//   if (!projectId) {
//     res.status(400).send("Project ID is missing.");
//     return;
//   }

//   const fieldsToUpdate = [];
//   const params = [];

//   fields.forEach((field) => {
//     if (req.body[field] !== undefined) {
//       if (field === "project_date") {
//         // Convert date to MySQL format 'YYYY-MM-DD'
//         const formattedDate = new Date(req.body[field])
//           .toISOString()
//           .slice(0, 10);
//         fieldsToUpdate.push(`${field} = ?`);
//         console.log(formattedDate)
//         params.push(formattedDate);
//       } else {
//         fieldsToUpdate.push(`${field} = ?`);
//         params.push(req.body[field]);
//       }
//     }
//   });

//   if (fieldsToUpdate.length === 0) {
//     res.status(400).send("No fields to update.");
//     return;
//   }

//   params.push(projectId);
//   const setClause = fieldsToUpdate.join(", ");
//   const sql = `UPDATE current_projects SET ${setClause} WHERE project_id = ?`;

//   connection.query(sql, params, (err, result) => {
//     if (err) {
//       console.error("Error updating project:", err);
//       res.status(500).send("Error updating project");
//       return;
//     }
//     console.log("Project updated successfully");
//     res.status(200).send("Project updated successfully");
//   });
// };


exports.updateProject = (req, res) => {
  const { projectId } = req.params;
  const fields = ["seo_title", "project_date", "project_description"];

  if (!projectId) {
    res.status(400).send("Project ID is missing.");
    return;
  }

  const fieldsToUpdate = [];
  const params = [];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "project_date") {
        // Convert date to MySQL format 'YYYY-MM-DD'
        const formattedDate = moment(req.body[field]).format("YYYY-MM-DD");
        fieldsToUpdate.push(`${field} = ?`);
        params.push(formattedDate);
      } else {
        fieldsToUpdate.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }
  });

  if (fieldsToUpdate.length === 0) {
    res.status(400).send("No fields to update.");
    return;
  }

  params.push(projectId);
  const setClause = fieldsToUpdate.join(", ");
  const sql = `UPDATE current_projects SET ${setClause} WHERE project_id = ?`;

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating project:", err);
      res.status(500).send("Error updating project");
      return;
    }
    console.log("Project updated successfully");
    res.status(200).send("Project updated successfully");
  });
};



exports.deleteProject = (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    res.status(400).send("Project ID is missing.");
    return;
  }

  const sql = "DELETE FROM current_projects WHERE project_id = ?";

  connection.query(sql, projectId, (err, result) => {
    if (err) {
      console.error("Error deleting project:", err);
      res.status(500).send("Error deleting project");
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send("Project not found");
      return;
    }
    console.log("Project deleted successfully");
    res.status(200).send("Project deleted successfully");
  });
};
