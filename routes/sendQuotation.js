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
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace `JWT_SECRET` with your actual secret key
        console.log('Decoded Token:', decoded); // Log the decoded token for debugging
        req.user = decoded; // Populate req.user with the decoded token payload
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(400).send('Invalid token.');
    }
};

// Route to submit a quotation
router.post('/apply-job/:jobId', authenticateUser, async (req, res) => {
    console.log('API hit: /apply-job/:jobId'); // Debugging log
    try {
        const { jobId } = req.params;
        const { quotation } = req.body;

        // Validate the job ID
        const job = await PostJob.findById(jobId);
        if (!job) {
            console.error('Job not found for ID:', jobId);
            return res.status(404).send('Job not found.');
        }

        // Save the quotation
        const newQuotation = new Quotation({
            jobId,
            userId: req.user.id, // req.user is populated by the middleware
            quotationText: quotation,
        });

        await newQuotation.save();
        res.status(201).send('Quotation submitted successfully.');
    } catch (error) {
        console.error('Error submitting quotation:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/applied-jobs', authenticateUser, async (req, res) => {
    try {
        const appliedJobs = await Quotation.find({ userId: req.user.id }).populate('jobId');
        res.status(200).json(appliedJobs);
    } catch (error) {
        console.error('Error fetching applied jobs:', error);
        res.status(500).send('Internal Server Error');
    }
});






module.exports = router;