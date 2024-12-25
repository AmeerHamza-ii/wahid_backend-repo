const express = require("express");
const router = express.Router();
const PostJob = require("../models/PostJob");
const Tradeperson = require("../models/Tradeperson");
const nodemailer = require("nodemailer");

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "myapprovedjobs@gmail.com",
        pass: "gmkz rlsv ppts xlmg", // Replace with your app-specific password
    },
});

// Helper function to validate email
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// Helper function to check if addresses match or are nearby
const isNearby = (jobAddress, tradepersonAddress) => {
    if (jobAddress.city === tradepersonAddress.city) {
        return true; // Same city
    }
    if (jobAddress.postcode.slice(0, 3) === tradepersonAddress.postcode.slice(0, 3)) {
        return true; // Nearby postcode (first 3 digits match)
    }
    return false;
};

// Route to handle job posting
router.post("/post-job", async (req, res) => {
    try {
        const { workType, serviceTime, propertyType, jobDescription, address, email } = req.body;

        // Validate required fields
        if (!workType || !serviceTime || !propertyType || !address || !email || !jobDescription) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Save the job to the database
        const newJob = new PostJob({
            workType,
            serviceTime,
            propertyType,
            jobDescription,
            address,
            contactEmail: email,
        });

        await newJob.save();

        // Send a response immediately after saving the job
        res.status(201).json({ message: "Job posted successfully.", job: newJob });

        // Run email notifications in the background
        const matchingTradepersons = await Tradeperson.find().lean();
        const nearbyTradepersons = matchingTradepersons.filter((tp) =>
            isNearby(address, tp.address)
        );

        nearbyTradepersons.forEach((tradeperson) => {
            if (isValidEmail(tradeperson.email)) {
                const mailOptions = {
                    from: "myapprovedjobs@gmail.com",
                    to: tradeperson.email,
                    subject: "New Job Posted Matching Your Location",
                    text: `Hello ${tradeperson.name},\n\nA new job has been posted near your location:\n\n- Work Type: ${workType}\n- Service Time: ${serviceTime}\n- Property Type: ${propertyType}\n- Job Description: ${jobDescription}\n- Address: ${address.street}, ${address.city}, ${address.postcode}\n\nVisit your dashboard to apply for this job.\n\nBest regards,\nThe Job Portal Team,`
                };

                transporter.sendMail(mailOptions).catch((error) =>
                    console.error(`Error sending email to ${tradeperson.email}:`, error)
                );
            }
        });

        console.log("Emails are being sent in the background.");
    } catch (error) {
        console.error("Error posting job:", error);
        res.status(500).json({ error: "Failed to post job" });
    }
});

module.exports = router;