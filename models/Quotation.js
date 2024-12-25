const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "PostJob", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Tradeperson", required: true },
    quotationText: { type: String, required: true },
    isAccepted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Quotation", quotationSchema);
