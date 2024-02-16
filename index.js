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
        res.json(response.data);
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
