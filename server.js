const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 10000;

app.use(cors());
// Serve static files from the same directory
app.use(express.static(__dirname));

// Your existing API route
app.get('/getHistory', async (req, res) => {
    const { month, day } = req.query;
    if (!month || !day) {
        return res.status(400).json({ error: 'Month and day are required parameters.' });
    }

    const url = `https://en.wikipedia.org/wiki/${month}_${day}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        console.log(`Fetching from: ${url}`);

        const scrapeAllSections = () => {
            const events = [];
            const births = [];
            const deaths = [];
            
            let currentSection = '';
            
            const content = $('#mw-content-text').length ? $('#mw-content-text') : $('body');
            
            content.find('h2, h3, ul').each((i, elem) => {
                const element = $(elem);
                
                if (element.is('h2, h3')) {
                    const text = element.text().trim();
                    if (text.includes('Events')) currentSection = 'events';
                    else if (text.includes('Births')) currentSection = 'births';
                    else if (text.includes('Deaths')) currentSection = 'deaths';
                    else if (text.includes('Holidays') || text.includes('References')) currentSection = '';
                }
                
                if (element.is('ul') && currentSection) {
                    element.find('li').each((j, li) => {
                        let text = $(li).text().trim();
                        text = text.replace(/\[\d+\]/g, '').trim();
                        
                        if (text && text.length > 0) {
                            if (currentSection === 'events') events.push(text);
                            else if (currentSection === 'births') births.push(text);
                            else if (currentSection === 'deaths') deaths.push(text);
                        }
                    });
                }
            });
            
            return { events, births, deaths };
        };

        const { events, births, deaths } = scrapeAllSections();

        console.log(`Scraped: ${events.length} events, ${births.length} births, ${deaths.length} deaths`);

        res.json({
            Events: events,
            Births: births,
            Deaths: deaths,
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch data from Wikipedia.' });
    }
});

// Serve index.html for all other routes (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});