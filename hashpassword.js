const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10); // Adjust salt rounds if needed
    console.log("Hashed Password:", hashedPassword);
};

hashPassword("adminexamplepassword"); // Replace with your desired password
