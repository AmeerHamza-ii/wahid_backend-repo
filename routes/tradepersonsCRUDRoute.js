const express = require("express");
const Tradeperson = require("../models/Tradeperson");
const authenticateAdmin = require("../middlewares/adminAuth");

const router = express.Router();

// Create a new tradesperson
router.post("/tradespeople", authenticateAdmin, async (req, res) => {
    try {
        const { name, email, trade, password } = req.body;

        // Check for missing fields
        if (!name || !email || !trade || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check for existing tradesperson
        const existingTradeperson = await Tradeperson.findOne({ email });
        if (existingTradeperson) {
            return res.status(400).json({ error: "Tradesperson already exists" });
        }

        const newTradeperson = new Tradeperson({ name, email, trade, password });
        await newTradeperson.save();
        res.status(201).json(newTradeperson);
    } catch (error) {
        console.error("Error creating tradesperson:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update an existing tradesperson
router.put("/tradespeople/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedTradeperson = await Tradeperson.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedTradeperson) {
            return res.status(404).json({ error: "Tradesperson not found" });
        }

        res.status(200).json(updatedTradeperson);
    } catch (error) {
        console.error("Error updating tradesperson:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete a tradesperson
router.delete("/tradespeople/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTradeperson = await Tradeperson.findByIdAndDelete(id);
        if (!deletedTradeperson) {
            return res.status(404).json({ error: "Tradesperson not found" });
        }

        res.status(200).json({ message: "Tradesperson deleted successfully" });
    } catch (error) {
        console.error("Error deleting tradesperson:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
