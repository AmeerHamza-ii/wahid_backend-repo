const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const clientRoutes = require('./routes/clientRoutes');
const postJobRoutes = require('./routes/PostJobRoutes'); // Correctly import the route
const getjobsRoutes=require('./routes/getJobs');
const matchingJobsRoutes = require("./routes/matchingjobsRoutes"); // Adjust the path as needed
const quotationRoutes=require('./routes/QuotationJobRoute') ;
const appliedjobs=require("./routes/appliedjobs");
const adminRoutes=require("./routes/admin");
const client=require("./routes/clients");
const job=require("./routes/jobs");
const tradepersonRoutes=require("./routes/tradepersonroute");
const sendqt=require("./routes/sendQuotation");
const jobDescriptionRoutes=require("./routes/jobDescriptionRoute");
const acceptedQuotation=require("./routes/acceptQuotation");
const acceptQuotationRoutes=require("./routes/radepersonQuotaipn");


dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// API Routes
app.use('/client', clientRoutes);
app.use('/tradeperson', tradepersonRoutes);
// Use the PostJob routes
// Multi-step Form Endpoint
// Use the route
app.use("/api", postJobRoutes);
  

app.use("/api",getjobsRoutes);

app.use("/api", matchingJobsRoutes);

app.use('/api', quotationRoutes);
app.use('/api', sendqt);

app.use('/api', appliedjobs);

app.use("/api", acceptedQuotation); // Accept quotation route

// Route for accepting quotations
app.use("/api", acceptQuotationRoutes);

app.use("/api/admin", adminRoutes); // Admin routes

app.use("/api/admin/tradespeople", adminRoutes); // Admin routes

app.use("/api/admin/clients",client);

app.use("/api/admin/jobs",job);


app.use("/api/job-description", jobDescriptionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
