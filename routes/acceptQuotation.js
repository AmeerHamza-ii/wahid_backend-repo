const express = require("express");
const router = express.Router();
const PostJob = require("../models/PostJob");
const Quotation = require("../models/Quotation");
const Tradeperson = require("../models/Tradeperson");
const nodemailer = require("nodemailer");

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "myapprovedjobs@gmail.com", // Your email
        pass: "gmkz rlsv ppts xlmg", // Replace with your app-specific password
     // Your app-specific password
    },
});

// Accept a quotation
router.post("/accept-quotation/:jobId/:quotationId", async (req, res) => {
    const { jobId, quotationId } = req.params;

    try {
        // Find the job
        const job = await PostJob.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: "Job not found." });
        }

        // Find the quotation
        const quotation = await Quotation.findById(quotationId).populate("userId");
        if (!quotation) {
            return res.status(404).json({ error: "Quotation not found." });
        }

        // Mark the quotation as accepted
        quotation.isAccepted = true;
        quotation.clientDetails = {
            email: job.contactEmail,
            address: job.address,
        };
        await quotation.save();

        // Update the job with the accepted quotation
        job.acceptedQuotation = {
            tradeperson: {
                _id: quotation.userId._id,
                name: quotation.userId.name,
                email: quotation.userId.email,
                contactNumber: quotation.userId.contactNumber,
            },
            quotationText: quotation.quotationText,
        };
        job.isActive = false; // Mark job as inactive after acceptance
        await job.save();

        // Send email to the tradeperson
        const mailOptions = {
            from: "myapprovedjobs@gmail.com",
            to: quotation.userId.email,
            subject: "Your Quotation Has Been Accepted",
            text: `
Hello ${quotation.userId.name},

Your quotation for the job "${job.workType}" has been accepted by the client.

Client Details:
- Email: ${job.contactEmail}
- Address: ${job.address.street}, ${job.address.city}, ${job.address.postcode}

Best regards,
The Job Portal Team
`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending email:", err);
            } else {
                console.log("Email sent:", info.response);
            }
        });

        res.status(200).json({
            message: "Quotation accepted and email sent to the tradeperson.",
            tradeperson: job.acceptedQuotation.tradeperson,
            quotationText: job.acceptedQuotation.quotationText,
        });
    } catch (error) {
        console.error("Error accepting quotation:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;