const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET); // Use your secret
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: "Access denied. Not an admin." });
        }
        req.admin = decoded; // Attach admin details to request object
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(400).json({ error: "Invalid token." });
    }
};

module.exports = authenticateAdmin;
