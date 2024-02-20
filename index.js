const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import cors middleware
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 1313;

// Enable CORS for all routes
app.use(cors());

app.get('/jobs', async (req, res) => {
    try {
        const apiToken = process.env.API_KEY; // Use API token from environment variable

        const options = {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            },
            params: {
                state: 'published', // Filter jobs by state being published
                limit: 100
            }
        };

        const response = await axios.get('https://simple-machines-3.workable.com/spi/v3/jobs', options);
        const jobs = response.data.jobs;

        // Extract shortcodes from job details
        const shortcodes = jobs.map(job => job.shortcode);

        // Get details for each job, including requirements and description
        const jobDetailsWithDescription = await Promise.all(shortcodes.map(async (shortcode) => {
            const jobResponse = await axios.get(`https://simple-machines-3.workable.com/spi/v3/jobs/${shortcode}`, options);
            const jobData = jobResponse.data;

            // Extract location details
            const location = jobData.location || {};
            const city = location.city || "City not specified";
            const region = location.region || "Region not specified";
            const country = location.country || "Country not specified";
            const workplaceType = location.workplace_type || "Workplace type not specified";

            return {
                title: jobData.title,
                full_title: jobData.full_title,
                shortcode: jobData.shortcode,
                department: jobData.department,
                shortlink: jobData.shortlink,
                city: city,
                region: region,
                country: country,
                workplace_type: workplaceType,
                requirements: jobData.requirements,
                description: jobData.description // Include description
            };
        }));

        res.json(jobDetailsWithDescription);
    } catch (error) {
        console.error('Error fetching job details:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Error fetching job details'
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/jobs`);
});