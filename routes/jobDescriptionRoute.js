const express = require("express");
const router = express.Router();
const PostJob = require("../models/PostJob");

// Save Job Description
router.post("/job-description/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const { description } = req.body;

  if (!description || description.split(" ").length > 100) {
    return res.status(400).json({ error: "Description must be between 1 and 100 words." });
  }

  try {
    const job = await PostJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }

    job.description = description;
    await job.save();

    res.status(200).json({ message: "Job description saved successfully." });
  } catch (error) {
    console.error("Error saving job description:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
