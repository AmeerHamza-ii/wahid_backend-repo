const mongoose = require('mongoose');

const tradepersonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    trade: { type: String, required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postcode: { type: String, required: true },
    },
    password: { type: String, required: true },
    appliedJobs: [
        {
            jobId: { type: mongoose.Schema.Types.ObjectId, ref: "PostJob" },
            quotationId: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
            status: { type: String, default: "Pending" }, // "Pending", "Accepted"
            clientDetails: {
                email: { type: String },
                name: { type: String },
            },
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model('Tradeperson', tradepersonSchema);
