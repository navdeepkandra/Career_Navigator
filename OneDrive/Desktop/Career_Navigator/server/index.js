import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import SKILLS_DICTIONARY from './skillsDictionary.js';
import pLimit from 'p-limit';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- 2. Create a rate limiter ---
// This ensures we only make a maximum of 2 API calls to Google per second.
const limit = pLimit(2);

// Dynamic Resource Fetching Function
async function getLearningResource(skill) {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.GOOGLE_API_KEY,
        cx: process.env.SEARCH_ENGINE_ID,
        q: `${skill} tutorial for beginners`
      }
    });
    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].link;
    }
    return null;
  } catch (error) {
    // Log the specific error but don't crash the whole process
    console.error(`Error fetching resource for ${skill}:`, error.message);
    return null;
  }
}

app.post('/api/analyze', async (req, res) => {
  const { jobRole, userText } = req.body;
  if (!jobRole || !userText) {
    return res.status(400).json({ error: 'Job role and user text are required' });
  }

  try {
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: { query: jobRole, num_pages: '1' },
      headers: { 'X-RapidAPI-Key': process.env.RAPID_API_KEY, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' }
    };
    const response = await axios.request(options);
    const jobs = response.data.data;
    const requiredSkillsSet = new Set();
    if (jobs && jobs.length > 0) {
      const description = (jobs[0].job_description || '').toLowerCase();
      SKILLS_DICTIONARY.forEach(skill => {
        if (description.includes(skill)) { requiredSkillsSet.add(skill); }
      });
    }
    const requiredSkills = Array.from(requiredSkillsSet);
    
    const userSkillsSet = new Set();
    const lowercasedUserText = userText.toLowerCase();
    SKILLS_DICTIONARY.forEach(skill => {
      const regex = new RegExp(`\\b${skill}\\b`, 'g');
      if (lowercasedUserText.match(regex)) { userSkillsSet.add(skill); }
    });
    const userSkills = Array.from(userSkillsSet);

    const matchedSkills = requiredSkills.filter(skill => userSkills.includes(skill));
    const missingSkillsRaw = requiredSkills.filter(skill => !userSkills.includes(skill));

    // --- 3. Use the rate limiter for the Google API calls ---
    console.log(`Rate-limiting the search for ${missingSkillsRaw.length} missing skills...`);
    const missingSkillsPromises = missingSkillsRaw.map(skill =>
      // Wrap each API call in our limiter
      limit(() => getLearningResource(skill).then(url => ({ skill, url })))
    );
    const missingSkills = await Promise.all(missingSkillsPromises);

    res.json({ jobTitle: jobRole, requiredSkills, matchedSkills, missingSkills });

  } catch (error) {
    console.error("Error during analysis:", error.message);
    res.status(500).json({ error: 'Failed to perform analysis.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});