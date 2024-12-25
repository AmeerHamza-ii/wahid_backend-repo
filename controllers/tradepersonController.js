const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Tradeperson = require('../models/Tradeperson');

exports.registerTradeperson = async (req, res) => {
    const { name, email, location, trade, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const tradeperson = new Tradeperson({ name, email, location, trade, password: hashedPassword });
        await tradeperson.save();
        res.status(201).send('Tradeperson registered successfully.');
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.loginTradeperson = async (req, res) => {
    const { email, password } = req.body;
    const tradeperson = await Tradeperson.findOne({ email });
    if (!tradeperson) return res.status(404).send('Tradeperson not found.');

    const isMatch = await bcrypt.compare(password, tradeperson.password);
    if (!isMatch) return res.status(400).send('Invalid credentials.');

    const token = jwt.sign({ id: tradeperson._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token });
};
