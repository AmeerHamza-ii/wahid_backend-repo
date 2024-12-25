const express = require("express");
const router = express.Router();
const Job = require("../models/PostJob");
const Tradeperson = require("../models/Tradeperson");
const Client = require("../models/Client");

router.post('/api/accept-quotation/:jobId/:quotationId', async (req, res) => {
    const { jobId, quotationId } = req.params;
    const { clientEmail } = req.body;

    console.log("Job ID:", jobId);
    console.log("Quotation ID:", quotationId);
    console.log("Client Email:", clientEmail);
 

    try {
        const job = await Job.findById(jobId).populate("quotations");
        const quotation = job.quotations.id(quotationId);

        if (!job || !quotation) {
            console.error("Job or Quotation not found.");
            return res.status(404).send({ error: "Job or Quotation not found." });
        }

        console.log("Found Job:", job);
        console.log("Found Quotation:", quotation);

        job.acceptedQuotation = {
            tradeperson: {
                _id: quotation.tradepersonId,
                name: quotation.tradepersonName,
                email: quotation.tradepersonEmail,
                contactNumber: quotation.tradepersonContact,
            },
            quotationText: quotation.quotationText,
        };
        await job.save();

        const client = await Client.findOne({ email: clientEmail });
        if (!client) {
            console.error("Client not found.");
            return res.status(404).send({ error: "Client not found." });
        }

        console.log("Found Client:", client);

        // Update the tradesperson's appliedJobs array
        const updateResult = await Tradeperson.updateOne(
            { _id: quotation.tradepersonId, "appliedJobs.jobId": jobId },
            {
                $set: {
                    "appliedJobs.$.status": "Accepted",
                    "appliedJobs.$.clientDetails": {
                        email: client.email,
                        name: client.name,
                    
                    },
                },
            }
        );

        console.log("Update Result:", updateResult);

        res.status(200).send({ message: "Quotation accepted successfully!" });
    } catch (error) {
        console.error("Error accepting quotation:", error);
        res.status(500).send({ error: "Failed to accept quotation." });
    }
});


module.exports = router;
