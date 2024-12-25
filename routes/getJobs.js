const express = require('express');
const PostJob = require('../models/PostJob');
const Quotation=require('../models/Quotation');


const router = express.Router();

router.get("/jobs", async (req, res) => {
    try {
        const clientEmail = req.query.email;
        if (!clientEmail) {
            return res.status(400).send("Client email is required.");
        }

        // Fetch jobs posted by the client
        const jobs = await PostJob.find({ contactEmail: clientEmail });

        // Fetch quotations for each job
        const jobsWithQuotations = await Promise.all(
            jobs.map(async (job) => {
                const quotations = await Quotation.find({ jobId: job._id }).populate("userId");
                return {
                    ...job.toObject(),
                    isActive: quotations.length > 0, // Mark job as active if it has quotations
                    quotations: quotations || [],   // Include quotations
                };
            })
        );

        res.status(200).json(jobsWithQuotations);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;