const express = require("express");
const router = express.Router();
const Quotation = require("../models/Quotation");


// Fetch quotations for the logged-in tradeperson
router.get("/tradeperson/quotations", async (req, res) => {
    try {
        const tradepersonId = req.user.id;

        const quotations = await Quotation.find({ userId: tradepersonId })
            .populate("jobId", "workType address contactEmail") // Populate job details
            .lean();

        res.status(200).json(quotations);
    } catch (error) {
        console.error("Error fetching quotations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
