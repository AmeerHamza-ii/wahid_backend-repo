const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Hard-coded admin credentials
const ADMIN_EMAIL = "admin@login.com";
const ADMIN_PASSWORD = "admin123";

// Admin Login Route
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Validate email and password
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a token
    const token = jwt.sign(
        { email, isAdmin: true },
        process.env.ADMIN_JWT_SECRET, // Replace with a secure secret key
        { expiresIn: "1h" }
    );

    res.status(200).json({ token });
});


const bcrypt = require("bcryptjs");
const Tradeperson = require("../models/Tradeperson");
const authenticateAdmin = require("../middlewares/adminAuth");


// Fetch all tradespersons
router.get("/", authenticateAdmin, async (req, res) => {
    try {
        const tradespersons = await Tradeperson.find();
        res.status(200).json(tradespersons);
    } catch (error) {
        console.error("Error fetching tradespersons:", error);
        res.status(500).json({ error: "Error fetching tradespersons" });
    }
});

// Create a new tradesperson
router.post("/", authenticateAdmin, async (req, res) => {
    try {
        const { name, email, trade, password } = req.body;

        // Validate required fields
        if (!name || !email || !trade || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if the email is already in use
        const existingTradeperson = await Tradeperson.findOne({ email });
        if (existingTradeperson) {
            return res.status(400).json({ error: "Tradesperson already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new tradesperson
        const newTradeperson = new Tradeperson({
            name,
            email,
            trade,
            password: hashedPassword,
        });

        await newTradeperson.save();
        res.status(201).json(newTradeperson);
    } catch (error) {
        console.error("Error creating tradesperson:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update a tradesperson
router.put("/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // If password is included, hash it
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

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
router.delete("/:id", authenticateAdmin, async (req, res) => {
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




