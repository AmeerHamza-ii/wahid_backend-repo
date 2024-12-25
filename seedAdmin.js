const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin"); // Path to your Admin schema

mongoose
    .connect("mongodb://localhost:27017/mern_roles", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

const seedAdmin = async () => {
    try {
        const hashedPassword = await bcrypt.hash("adminpassword", 10); // Replace with your desired password
        const admin = new Admin({
            name: "Super Admin",
            email: "admin@example.com",
            password: hashedPassword,
        });

        await admin.save();
        console.log("Admin user created successfully!");
    } catch (error) {
        console.error("Error creating admin user:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedAdmin();
