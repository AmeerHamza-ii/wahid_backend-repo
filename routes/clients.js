const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // For hashing passwords
const Client = require("../models/Client"); // Client model
const authenticateAdmin = require("../middlewares/adminAuth"); // Admin authentication middleware

// Route to fetch all clients
router.get("/", authenticateAdmin, async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).json(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ error: "Failed to fetch clients." });
    }
});

// Route to update a client
router.put("/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, phoneNumber, address } = req.body;

        // Validate required fields
        if (!name || !email || !phoneNumber || !address) {
            return res.status(400).json({ error: "Name, email, phone number, and address are required." });
        }

        // Hash the password if provided
        const updatedData = {
            name,
            email,
            phoneNumber,
            address, // Expects { street, city, postcode }
        };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedData.password = hashedPassword;
        }

        // Find and update the client
        const updatedClient = await Client.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!updatedClient) {
            return res.status(404).json({ error: "Client not found." });
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({ error: "Failed to update client." });
    }
});

// Route to delete a client
router.delete("/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedClient = await Client.findByIdAndDelete(id);
        if (!deletedClient) {
            return res.status(404).json({ error: "Client not found." });
        }

        res.status(200).json({ message: "Client deleted successfully." });
    } catch (error) {
        console.error("Error deleting client:", error);
        res.status(500).json({ error: "Failed to delete client." });
    }
});

module.exports = router;
