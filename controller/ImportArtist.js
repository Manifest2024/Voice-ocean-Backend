const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const shortUUID = require("short-uuid");
const { v4: uuidv4 } = require("uuid");
const connection = require("../db.js");

// Multer setup for file upload
exports.upload = multer({ dest: "uploads/" });

// exports.importArtistsAndSamples = (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).send("No file uploaded.");
//   }

//   try {
//     const workbook = xlsx.readFile(file.path);
//     console.log(workbook.Sheets)
//     const dataSheet = workbook.Sheets["Sheet1"];
//     if (!dataSheet) {
//       fs.unlinkSync(file.path);
//       return res
//         .status(400)
//         .send("Invalid Excel format. Sheet is required.");
//     }

//     const data = xlsx.utils.sheet_to_json(dataSheet);
//     if (!data.length) {
//       fs.unlinkSync(file.path);
//       return res.status(400).send("The 'Artists' sheet is empty.");
//     }

//     const artistMap = new Map();

//     data.forEach((row) => {
//       const {
//         artist_name,
//         gender,
//         voice_sample_language,
//         voice_sample_category,
//         voice_sample_title,
//         voice_sample_sample_path,
//         address,
//         profile_photo,
//         accents,
//         roles,
//         styles,
//         title,
//         description,
//         languages,
//         category,
//         service_type,
//         artist_tag,
//       } = row;
//       if (
//         !artist_name ||
//         !voice_sample_language ||
//         !voice_sample_category ||
//         !voice_sample_sample_path
//       ) {
//         console.error("Invalid data in row:", row);
//         return;
//       }

//       if (!artistMap.has(artist_name)) {
//         const artistId = shortUUID.generate();
//         artistMap.set(artist_name, artistId);

//         // const insertArtistQuery = `INSERT INTO artists (id, name, gender, address, profile_photo, accents, roles, styles, microphone, services_offered, availability_days, availability_time, title, description, languages, category, service_type, artist_tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//         const insertArtistQuery = `INSERT INTO artists (id, name, gender, address, profile_photo, accents, roles, styles, title, description, languages, category, service_type, artist_tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//         connection.query(
//           insertArtistQuery,
//           [
//             artistId,
//             artist_name,
//             gender || null,
//             address || null,
//             profile_photo || null,
//             accents || null,
//             roles || null,
//             styles || null,
//             title || null,
//             description || null,
//             languages || null,
//             category || null,
//             service_type || null,
//             artist_tag || null,
//           ],
//           (err) => {
//             if (err) console.error("Error inserting artist:", err);
//           }
//         );
//       }

//       const artistId = artistMap.get(artist_name);
//       const sampleId = uuidv4();
//       const insertSampleQuery = `INSERT INTO voice_samples (id, language, artist_id, artist_name, sample, category, title) VALUES (?, ?, ?, ?, ?, ?, ?)`;

//       connection.query(
//         insertSampleQuery,
//         [
//           sampleId,
//           voice_sample_language,
//           artistId,
//           artist_name,
//           voice_sample_sample_path,
//           voice_sample_category,
//           voice_sample_title,
//         ],
//         (err) => {
//           if (err) console.error("Error inserting voice sample:", err);
//         }
//       );
//     });

//     fs.unlinkSync(file.path);
//     res.status(200).send("Artists and Voice Samples imported successfully.");
//   } catch (error) {
//     console.error("Error importing data:", error);
//     fs.unlinkSync(file.path);
//     res.status(500).send("Error importing data.");
//   }
// };



exports.importArtistsAndSamples = (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const workbook = xlsx.readFile(file.path);
    const sheetNames = workbook.SheetNames[0];
    console.log("Available Sheets:", sheetNames);
    const dataSheet = workbook.Sheets[sheetNames];
    if (!dataSheet) {
      fs.unlinkSync(file.path);
      return res
        .status(400)
        .send(`Invalid Excel format. Sheet '${sheetNames}' is required.`);
    }

    // Parse the data into JSON
    const rawData = xlsx.utils.sheet_to_json(dataSheet, { defval: null }); // Use null for missing values
    console.log("Parsed Data:", rawData);

    if (!rawData.length) {
      fs.unlinkSync(file.path);
      return res.status(400).send("The 'Sheet1' is empty.");
    }

    // Normalize and map the headers
    const headers = Object.keys(rawData[0]).map((header) =>
      header.trim().toLowerCase().replace(/ /g, "_")
    );

    const data = rawData.map((row) =>
      headers.reduce((acc, header, index) => {
        acc[header] = row[Object.keys(row)[index]];
        return acc;
      }, {})
    );

    const artistMap = new Map();

    data.forEach((row) => {
      const {
        artist_name,
        gender,
        voice_sample_language,
        voice_sample_category,
        voice_sample_title,
        voice_sample_sample_path,
        address,
        profile_photo,
        accents,
        roles,
        styles,
        title,
        description,
        languages,
        category,
        service_type,
        artist_tag,
      } = row;

      if (
        !artist_name ||
        !voice_sample_language ||
        !voice_sample_category ||
        !voice_sample_sample_path
      ) {
        console.error("Invalid data in row:", row);
        return;
      }

      // Check if artist is already added and insert if not
      if (!artistMap.has(artist_name)) {
        const artistId = shortUUID.generate();
        artistMap.set(artist_name, artistId);

        const insertArtistQuery = `INSERT INTO artists (id, name, gender, address, profile_photo, accents, roles, styles, title, description, languages, category, service_type, artist_tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        connection.query(
          insertArtistQuery,
          [
            artistId,
            artist_name,
            gender || null,
            address || null,
            profile_photo || null,
            accents || null,
            roles || null,
            styles || null,
            title || null,
            description || null,
            languages || null,
            category || null,
            service_type || null,
            artist_tag || null,
          ],
          (err) => {
            if (err) console.error("Error inserting artist:", err);
          }
        );
      }

      // Insert voice sample data
      const artistId = artistMap.get(artist_name);
      const sampleId = uuidv4();
      const insertSampleQuery = `INSERT INTO voice_samples (id, language, artist_id, artist_name, sample, category, title) VALUES (?, ?, ?, ?, ?, ?, ?)`;

      connection.query(
        insertSampleQuery,
        [
          sampleId,
          voice_sample_language,
          artistId,
          artist_name,
          voice_sample_sample_path,
          voice_sample_category,
          voice_sample_title,
        ],
        (err) => {
          if (err) console.error("Error inserting voice sample:", err);
        }
      );
    });

    // Delete the uploaded file after processing
    fs.unlinkSync(file.path);
    res.status(200).send("Artists and Voice Samples imported successfully.");
  } catch (error) {
    console.error("Error importing data:", error);
    fs.unlinkSync(file.path);
    res.status(500).send("Error importing data.");
  }
};
