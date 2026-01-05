const connection = require("../db.js");
const shortUUID = require("short-uuid");

exports.searchArtist = (req, res) => {
  const { name } = req.query;

  if (!name) {
    res.status(400).send("Please provide a name to search for.");
    return;
  }

  const searchQuery = `
    SELECT name,id FROM artists WHERE name LIKE ?
  `;

  connection.query(searchQuery, [`%${name}%`], (err, results) => {
    if (err) {
      console.error("Error searching for artist:", err);
      res.status(500).send("Error searching for artist");
      return;
    }

    res.status(200).json(results);
  });
};

exports.getAllArtist = (req, res) => {
  const sql = "SELECT * FROM artists ORDER BY created_at DESC";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching artists:", err);
      res.status(500).send("Error fetching artists");
      return;
    }
    res.status(200).json(results);
  });
};

exports.addArtist = (req, res) => {
  const {
    name,
    address,
    gender,
    accents,
    roles,
    styles,
    microphone,
    services_offered,
    availability_days,
    availability_time,
    title,
    description,
    languages,
    category,
    service_type,
    artist_tag,
  } = req.body;

  if (!name || !gender) {
    return res.status(400).send("Artist name or gender is missing.");
  }

  let profile_photo = null;

  if (req.file) {
    profile_photo = `artist_images/${req.file.filename}`;
  }

  const artistId = shortUUID.generate();

  const sql = `
    INSERT INTO artists (
      id, name, gender, address, profile_photo, accents, roles, styles,
      microphone, services_offered, availability_days, availability_time,
      title, description, languages, category, service_type, artist_tag
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [
      artistId,
      name,
      gender,
      address,
      profile_photo,
      accents,
      roles,
      styles,
      microphone,
      services_offered,
      availability_days,
      availability_time,
      title,
      description,
      languages,
      category,
      service_type,
      artist_tag,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error inserting artist");
      }
      res.status(200).send("Artist added successfully");
    }
  );
};


// exports.getArtist = (req, res) => {
//   const { language, category, gender, service_type, artist_tag } = req.query;

//   let sql = `
//     SELECT artists.id, artists.name, artists.gender,artists.service_type,artists.artist_tag,artists.category AS artist_category,artists.languages, artists.address, artists.profile_photo, voice_samples.sample, voice_samples.language AS sample_language, voice_samples.category
//     FROM artists
//     INNER JOIN voice_samples ON artists.id = voice_samples.artist_id
//     WHERE 1=1
//   `;

//   const params = [];

//   if (category) {
//     sql += " AND voice_samples.category = ?";
//     params.push(category);
//   }

//   if (gender) {
//     sql += " AND artists.gender = ?";
//     params.push(gender);
//   }

//   if (service_type) {
//     sql += " AND artists.service_type = ?";
//     params.push(service_type);
//   }

//   if (artist_tag) {
//     sql += " AND artists.artist_tag = ?";
//     params.push(artist_tag);
//   }

//   connection.query(sql, params, (err, results) => {
//     if (err) {
//       console.error("Error fetching artists:", err);
//       res.status(500).send("Error fetching artists");
//       return;
//     }

//     // Group artists' voice samples by artist ID
//     const artistsData = {};
//     results.forEach((row) => {
//       const {
//         id,
//         name,
//         gender,
//         artist_category,
//         languages,
//         address,
//         profile_photo,
//         sample,
//         sample_language,
//         category,
//         service_type,
//         artist_tag,
//       } = row;
//       if (!artistsData[id]) {
//         artistsData[id] = {
//           id,
//           name,
//           gender,
//           artist_category,
//           languages,
//           address,
//           profile_photo,
//           service_type,
//           artist_tag,
//           voice_samples: [],
//         };
//       }
//       if (
//         (!language || sample_language === language) &&
//         (!category || row.category === category)
//       ) {
//         artistsData[id].voice_samples.push({
//           sample: `https://${req.get("host")}/${sample}`,
//           language: sample_language,
//           category: category,
//         });
//       }
//     });

//     // Convert object to array of artists
//     const artistsArray = Object.values(artistsData);
//     res.status(200).json(artistsArray);
//   });
// };

exports.getArtist = (req, res) => {
  const { language, category, gender, service_type, artist_tag } = req.query;

  let sql = `
    SELECT 
      artists.id, 
      artists.name, 
      artists.gender,
      artists.service_type,
      artists.artist_tag,
      artists.category AS artist_category,
      artists.languages,
      artists.address,
      artists.profile_photo,
      voice_samples.sample,
      voice_samples.language AS sample_language,
      voice_samples.category
    FROM artists
    INNER JOIN voice_samples ON artists.id = voice_samples.artist_id
    WHERE 1=1
  `;

  const params = [];

  // Add SQL conditions for each query parameter
  if (language) {
    sql += " AND artists.languages = ?";
    params.push(language);
  }

  if (category) {
    sql += " AND voice_samples.category = ?";
    params.push(category);
  }

  if (gender) {
    sql += " AND artists.gender = ?";
    params.push(gender);
  }

  if (service_type) {
    sql += " AND artists.service_type = ?";
    params.push(service_type);
  }

  if (artist_tag) {
    sql += " AND artists.artist_tag = ?";
    params.push(artist_tag);
  }

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching artists:", err);
      res.status(500).send("Error fetching artists");
      return;
    }

    const artistsData = {};
    results.forEach((row) => {
      const {
        id,
        name,
        gender,
        artist_category,
        languages,
        address,
        profile_photo,
        sample,
        sample_language,
        category,
        service_type,
        artist_tag,
      } = row;

      if (!artistsData[id]) {
        artistsData[id] = {
          id,
          name,
          gender,
          artist_category,
          languages,
          address,
          profile_photo,
          service_type,
          artist_tag,
          voice_samples: [],
        };
      }

      // Add voice sample only if it matches the category (if provided)
      if (!category || row.category === category) {
        artistsData[id].voice_samples.push({
          sample: `https://${req.get("host")}/${sample}`,
          language: sample_language,
          category: row.category,
        });
      }
    });

    const artistsArray = Object.values(artistsData);
    res.status(200).json(artistsArray);
  });
};

exports.getArtistData = (req, res) => {
  const { artistId } = req.params;

  if (!artistId) {
    res.status(400).send("Artist ID is missing.");
    return;
  }

  const artistQuery = "SELECT * FROM artists WHERE id = ?";
  connection.query(artistQuery, [artistId], (err, artistResults) => {
    if (err) {
      console.error("Error fetching artist:", err);
      res.status(500).send("Error fetching artist");
      return;
    }

    if (artistResults.length === 0) {
      res.status(404).send("Artist not found.");
      return;
    }

    const artist = artistResults[0];

    const languagesQuery = "SELECT * FROM languages WHERE artist_id = ?";
    const categoriesQuery = "SELECT * FROM category WHERE artist_id = ?";
    const voiceSamplesQuery = "SELECT * FROM voice_samples WHERE artist_id = ?";

    connection.query(languagesQuery, [artistId], (err, languagesResults) => {
      if (err) {
        console.error("Error fetching languages:", err);
        res.status(500).send("Error fetching languages");
        return;
      }

      connection.query(
        categoriesQuery,
        [artistId],
        (err, categoriesResults) => {
          if (err) {
            console.error("Error fetching categories:", err);
            res.status(500).send("Error fetching categories");
            return;
          }

          connection.query(
            voiceSamplesQuery,
            [artistId],
            (err, voiceSamplesResults) => {
              if (err) {
                console.error("Error fetching voice samples:", err);
                res.status(500).send("Error fetching voice samples");
                return;
              }

              const baseURL = "http://localhost:4000/api/";
              const updatedVoiceSamples = voiceSamplesResults.map((sample) => ({
                ...sample,
                sample: `${baseURL}${sample.sample}`,
              }));
              const artistData = {
                artist,
                languages: languagesResults,
                categories: categoriesResults,
                voiceSamples: updatedVoiceSamples,
              };

              res.status(200).json(artistData);
            }
          );
        }
      );
    });
  });
};

exports.getArtistDataByName = (req, res) => {
  const { name } = req.params;

  if (!name) {
    res.status(400).send("Artist ID is missing.");
    return;
  }

  const artistQuery = "SELECT * FROM artists WHERE name = ?";
  connection.query(artistQuery, [name], (err, artistResults) => {
    if (err) {
      console.error("Error fetching artist:", err);
      res.status(500).send("Error fetching artist");
      return;
    }

    if (artistResults.length === 0) {
      res.status(404).send("Artist not found.");
      return;
    }

    const artist = artistResults[0];
    const artistId = artist.id;

    const languagesQuery = "SELECT * FROM languages WHERE artist_id = ?";
    const categoriesQuery = "SELECT * FROM category WHERE artist_id = ?";
    const voiceSamplesQuery = "SELECT * FROM voice_samples WHERE artist_id = ?";

    connection.query(languagesQuery, [artistId], (err, languagesResults) => {
      if (err) {
        console.error("Error fetching languages:", err);
        res.status(500).send("Error fetching languages");
        return;
      }

      connection.query(
        categoriesQuery,
        [artistId],
        (err, categoriesResults) => {
          if (err) {
            console.error("Error fetching categories:", err);
            res.status(500).send("Error fetching categories");
            return;
          }

          connection.query(
            voiceSamplesQuery,
            [artistId],
            (err, voiceSamplesResults) => {
              if (err) {
                console.error("Error fetching voice samples:", err);
                res.status(500).send("Error fetching voice samples");
                return;
              }

              const baseURL = "http://localhost:4000/api/";
              const updatedVoiceSamples = voiceSamplesResults.map((sample) => ({
                ...sample,
                sample: `${baseURL}${sample.sample}`,
              }));
              const artistData = {
                artist,
                languages: languagesResults,
                categories: categoriesResults,
                voiceSamples: updatedVoiceSamples,
              };

              res.status(200).json(artistData);
            }
          );
        }
      );
    });
  });
};

// update artist
exports.updateArtist = (req, res) => {
  const { artistId } = req.params;

  if (!artistId) {
    return res.status(400).send("Artist ID is missing.");
  }

  const fields = [
    "name",
    "address",
    "gender",
    "accents",
    "roles",
    "styles",
    "languages",
    "category",
    "microphone",
    "services_offered",
    "availability_days",
    "availability_time",
    "title",
    "description",
    "service_type",
    "artist_tag",
  ];

  const updates = [];
  const values = [];

  fields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== "") {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  // ✅ IMAGE UPDATE
  if (req.file) {
    updates.push("profile_photo = ?");
    values.push(`artist_images/${req.file.filename}`);
  }

  if (updates.length === 0) {
    return res.status(400).send("No fields to update.");
  }

  values.push(artistId);

  const sql = `
    UPDATE artists
    SET ${updates.join(", ")}
    WHERE id = ?
  `;

  connection.query(sql, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating artist");
    }
    res.status(200).send("Artist updated successfully");
  });
};



// delete artist
exports.deleteArtist = (req, res) => {
  const { artistId } = req.params; // Assuming artistId is passed in the URL parameters

  if (!artistId) {
    res.status(400).send("Artist ID is missing.");
    return;
  }

  const sql = "DELETE FROM artists WHERE id = ?";

  connection.query(sql, [artistId], (err, result) => {
    if (err) {
      console.error("Error deleting artist:", err);
      res.status(500).send("Error deleting artist");
      return;
    }
    console.log("Artist deleted successfully");
    res.status(200).send("Artist deleted successfully");
  });
};