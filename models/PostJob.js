const mongoose = require("mongoose");

const postJobSchema = new mongoose.Schema({
  contactEmail: { type: String, required: true },
  workType: { type: String, required: true },
  serviceTime: { type: String, required: true },
  propertyType: { type: String, required: true },
  jobDescription: { type: String }, // Optional description for the job
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postcode: { type: String, required: true },
  },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" }, // Refer
  quotations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quotation" }],
  acceptedQuotation: {
    tradeperson: {
      _id: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      email: { type: String },
      contactNumber: { type: String },
      businessName: { type: String },
      address: { type: String },
    },
    quotationText: { type: String },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PostJob", postJobSchema);
