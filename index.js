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

        // Get requirements for each job
        const jobDetailsWithRequirements = await Promise.all(shortcodes.map(async (shortcode) => {
            const jobResponse = await axios.get(`https://simple-machines-3.workable.com/spi/v3/jobs/${shortcode}`, options);
            const jobData = jobResponse.data;

            return {
                title: jobData.title,
                full_title: jobData.full_title,
                shortcode: jobData.shortcode,
                department: jobData.department,
                shortlink: jobData.shortlink,
                location_str: jobData.location.location_str,
                workplace_type: jobData.location.workplace_type,
                requirements: jobData.requirements
            };
        }));

        res.json(jobDetailsWithRequirements);
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