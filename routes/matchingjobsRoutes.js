const express = require('express');
const jwt = require('jsonwebtoken');
const Tradeperson = require('../models/Tradeperson');
const PostJob = require('../models/PostJob');
const Quotation = require('../models/Quotation');

const router = express.Router();

// Helper function to check if two locations are nearby
const isNearby = (jobAddress, tradepersonAddress) => {
    if (!jobAddress || !tradepersonAddress) return false;

    // Match by city
    if (jobAddress.city.toLowerCase() === tradepersonAddress.city.toLowerCase()) {
        return true;
    }

    // Match by nearby postcode (e.g., first 3 characters match)
    if (
        jobAddress.postcode &&
        tradepersonAddress.postcode &&
        jobAddress.postcode.slice(0, 3) === tradepersonAddress.postcode.slice(0, 3)
    ) {
        return true;
    }

    return false;
};

// Route to fetch matching jobs
router.get('/matching-jobs', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Access Denied. No token provided.' });

        // Verify token and find tradesperson
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tradeperson = await Tradeperson.findById(decoded.id);
        if (!tradeperson) return res.status(404).json({ error: 'Tradesperson not found.' });

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Find jobs that the tradesperson has already applied for
        const appliedJobs = await Quotation.find({ userId: tradeperson._id }).select('jobId');
        const appliedJobIds = appliedJobs.map((job) => job.jobId);

        // Fetch jobs matching tradesperson's trade and location, excluding applied jobs
        const jobs = await PostJob.find({
            workType: tradeperson.trade,
            _id: { $nin: appliedJobIds }, // Exclude applied jobs
        })
            .lean() // Convert Mongoose documents to plain JavaScript objects
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)              // Skip previous pages
            .limit(limit);           // Limit results per page

        // Filter jobs by location matching
        const filteredJobs = jobs.filter((job) => isNearby(job.address, tradeperson.address));

        // Total job count for pagination
        const totalJobs = filteredJobs.length;

        res.status(200).json({
            jobs: filteredJobs,
            totalJobs,
            currentPage: page,
            totalPages: Math.ceil(totalJobs / limit),
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
