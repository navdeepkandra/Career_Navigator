const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// --- CONFIGURATION ---
// List of job titles we want to search for.
const JOB_QUERIES = [
  'Frontend Developer in Bengaluru',
  'Backend Developer Nodejs in Bengaluru',
  'Data Analyst in Bengaluru',
  'UI/UX Designer in Bengaluru'
];

// Your RapidAPI Key
const API_KEY = process.env.RAPID_API_KEY; // <-- PASTE YOUR KEY HERE

// --- MAIN FUNCTION ---
async function fetchAllJobs() {
  console.log('🚀 Starting to fetch data for all job queries...');
  const allJobData = [];
  let currentId = 1;

  // Loop through each query in our list
  for (const query of JOB_QUERIES) {
    console.log(`\n--- Fetching data for: "${query}" ---`);

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: { query: query, num_pages: '1' },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      const jobs = response.data.data;

      if (!jobs || jobs.length === 0) {
        console.log('  ❌ No jobs found for this query.');
        continue; // Skip to the next query
      }

      console.log(`  ✅ Found ${jobs.length} job listings.`);

      // --- Process skills for the current query ---
      const allSkills = new Set();
      const ourSkillsList = ['html', 'css', 'javascript', 'react', 'redux', 'typescript', 'angular', 'vue', 'node.js', 'express.js', 'git', 'webpack', 'jest', 'figma', 'sketch', 'adobe xd', 'sql', 'python', 'pandas', 'numpy', 'tableau', 'power bi', 'excel', 'mongodb', 'postgresql', 'docker', 'graphql'];
      
      jobs.forEach(job => {
        const description = (job.job_description || '').toLowerCase();
        ourSkillsList.forEach(skill => {
          if (description.includes(skill)) {
            allSkills.add(skill);
          }
        });
      });
      
      const skillsArray = Array.from(allSkills);
      console.log(`  🔎 Extracted ${skillsArray.length} unique skills.`);
      
      // Add the processed data to our main array
      allJobData.push({
        id: currentId++,
        jobTitle: query.replace(' in Bengaluru', ''), // Clean up the title for display
        requiredSkills: skillsArray
      });

    } catch (error) {
      console.error(`  ❌ Error fetching data for "${query}":`, error.response ? error.response.data : error.message);
    }
  }

  // --- SAVE FINAL RESULTS ---
  if (allJobData.length > 0) {
    fs.writeFileSync('api_skills_data.json', JSON.stringify(allJobData, null, 2));
    console.log(`\n💾 All data saved successfully to api_skills_data.json! Found data for ${allJobData.length} roles.`);
  } else {
    console.log('\n❌ No data was fetched for any query. File not updated.');
  }
}

// Run the script
fetchAllJobs();