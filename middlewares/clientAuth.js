const jwt = require("jsonwebtoken");
const Client = require("../models/Client");

const authenticateClient = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const client = await Client.findById(decoded.id);

        if (!client) {
            return res.status(404).json({ error: "Client not found." });
        }

        req.user = client; // Attach the client to the request object
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(400).json({ error: "Invalid token." });
    }
};

module.exports = authenticateClient;
