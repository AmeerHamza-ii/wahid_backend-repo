const express = require("express");
const router = express.Router();
const PostJob = require("../models/PostJob");
const Quotation = require("../models/Quotation");
const authenticateAdmin = require("../middlewares/adminAuth");

// Fetch all jobs with client and tradeperson details
router.get("/", authenticateAdmin, async (req, res) => {
    try {
        const jobs = await PostJob.find()
            .populate("clientId", "name email") // Populate client info
            .sort({ createdAt: -1 }) // Sort by latest jobs first
            .lean(); // Convert Mongoose documents to plain objects

        // Fetch quotations for each job
        const jobsWithApplications = await Promise.all(
            jobs.map(async (job) => {
                const quotations = await Quotation.find({ jobId: job._id })
                    .populate("userId", "name email") // Populate tradeperson info
                    .lean();
                return {
                    ...job,
                    quotations, // Add quotations to the job object
                };
            })
        );

        res.status(200).json(jobsWithApplications);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Admin delete job by ID
router.delete("/:jobId", authenticateAdmin, async (req, res) => {
    try {
        const { jobId } = req.params;

        const deletedJob = await PostJob.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({ error: "Job not found" });
        }

        // Delete associated quotations
        await Quotation.deleteMany({ jobId });

        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
