const express = require("express");
const artist = require("../controller/artist.js");
const category = require("../controller/category.js");
const language = require("../controller/language.js");
const voiceSample = require("../controller/voiceSample.js");
const blog = require("../controller/blog.js");
const upload = require("../controller/upload.js");
const quotation = require("../controller/quotation.js");
const currentProjects = require("../controller/currentProjects.js");
const testimonials = require("../controller/testimonials.js");
const client = require("../controller/client.js");
const importArist = require("../controller/ImportArtist.js");

const router = express.Router();

// Import artist
router.post(
  "/import/artists",
  importArist.upload.single("file"),
  importArist.importArtistsAndSamples
);


// artist
router.post("/create/artists", artist.addArtist);
router.get("/artists", artist.getArtist);
router.get("/artists/profile/:artistId", artist.getArtistData);
router.get("/artists/profile/name/:name", artist.getArtistDataByName);
router.patch("/update/artist/:artistId", artist.updateArtist);
router.delete("/delete/artist/:artistId", artist.deleteArtist);
router.get("/get/all/artists", artist.getAllArtist);
router.get("/search/artist", artist.searchArtist);

// Blog
router.post(
  "/add/blog",
  upload.single("image"),
  blog.addBlog
);
router.get("/get/blog", blog.getAllBlogs);
router.get("/get/blog/:id", blog.getBlogById);
router.delete("/delete/blog/:id", blog.deleteBlog);
router.patch(
  "/update/blog/:id",
  upload.single("image"),
  blog.updateBlog
);


// voice samples
router.get("/get/languages/and/category", voiceSample.getLanguagesAndCategory);
router.delete("/delete/voice/sample/:sampleId", voiceSample.deleteVoiceSample);
router.get("/get/all/voice/samples", voiceSample.getAllVoiceSample);
router.patch(
  "/update/voice/sample/:sampleId",
  upload.single("sample"),
  voiceSample.updateVoiceSample
);


// language
router.post("/add/languages", language.addLanguage);
router.delete("/delete/language/:languageId", language.deleteLanguage);

// category
router.post("/add/category", category.addCategory);
router.delete("/delete/category/:categoryId", category.deleteCategory);

// quotation
router.post("/get/quotation", quotation.addQuotation);
router.get("/get/all/quotations", quotation.getAllQuotations);
router.patch("/update/quotation/:quotationId", quotation.updateQuotation);
router.delete("/delete/order/:orderId", quotation.deleteOrder);

router.post("/artist/contact/us",quotation.contactUsAPI)

// dashboard API
router.get("/dashboard/data", quotation.dashboardAPI);

// current projects
router.get("/get/all/current/projects", currentProjects.getAllProjects);
router.post("/add/current/projects", currentProjects.addCurrentPoject);
router.patch(
  "/update/current/projects/:projectId",
  currentProjects.updateProject
);
router.delete(
  "/delete/current/projects/:projectId",
  currentProjects.deleteProject
);

// testimonials
router.get("/get/all/testimonials", testimonials.getAllTestimonials);
router.post("/add/testimonials", testimonials.addTestimonials);
router.patch(
  "/update/testimonials/:testimonialId",
  testimonials.updateTestimonial
);
router.delete(
  "/delete/testimonials/:testimonialId",
  testimonials.deleteTestimonials
);

//  client
router.post(
  "/clients/upload",
  upload.single("clientLogo"),
  client.uploadClientImage
);

router.get('/get/all/client/logos', client.getAllClients)
router.delete("/delete/client/logo/:clientId", client.deleteClient);


module.exports = router;