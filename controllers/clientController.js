const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');



exports.registerClient = async (req, res) => {
    const { name, email, password, confirmPassword, phoneNumber, street, city, postcode } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword || !phoneNumber || !street || !city || !postcode) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Validate password match
    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match." });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new client
        const client = new Client({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            address: {
                street,
                city,
                postcode,
            },
        });

        await client.save();
        res.status(201).json({ message: "Client registered successfully." });
    } catch (error) {
        console.error("Error registering client:", error);
        if (error.code === 11000) {
            // Handle unique constraint error for email
            return res.status(400).json({ error: "Email already exists." });
        }
        res.status(500).json({ error: "Server error." });
    }
};


exports.loginClient = async (req, res) => {
    const { email, password } = req.body;
    const client = await Client.findOne({ email });
    if (!client) return res.status(404).send('Client not found.');

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) return res.status(400).send('Invalid credentials.');

    const token = jwt.sign({ id: client._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token });
};
