const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Quotation = require('../models/Quotation');
const PostJob = require('../models/PostJob');

// Authentication Middleware
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send('Access Denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace JWT_SECRET with your actual secret key
        req.user = decoded; // Populate req.user with the decoded token payload
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(400).send('Invalid token.');
    }
};

// Get applied jobs with accepted status
router.get('/api/applied-jobs', async (req, res) => {
    try {
        const jobs = await AppliedJob.find({ userId: req.user.id })
            .populate('jobId')
            .sort({ createdAt: 1 }); // Sort by createdAt in ascending order (earliest first)

        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching applied jobs:", error);
        res.status(500).send({ error: "Failed to fetch applied jobs." });
    }
});



module.exports = router;