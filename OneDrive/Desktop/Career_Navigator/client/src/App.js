import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// --- Firebase Imports ---
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import Auth from './Auth';

// --- Chart.js Imports ---
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the Chart.js components we need
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  // --- State for Authentication & Profile Dropdown ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- State for the Main Tool ---
  const [jobQuery, setJobQuery] = useState('Frontend Developer in Bengaluru');
  const [userText, setUserText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Effect to listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Function to call our backend for analysis
  const handleAnalyze = async () => {
    if (!jobQuery || !userText) {
      setError('Please provide both a job role and a description of your skills.');
      return;
    }
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const response = await axios.post('https://career-navigator-api.onrender.com/api/analyze', {
        jobRole: jobQuery,
        userText: userText
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response ? err.response.data.error : 'An unexpected error occurred.');
      console.error("Error performing analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to log the user out
  const handleLogout = () => {
    signOut(auth);
    setIsDropdownOpen(false); // Close dropdown on logout
  };

  // Helper function to get the user's initial from their email
  const getInitial = (email) => email ? email.charAt(0).toUpperCase() : '?';

  // Data and options for the bar chart
  const chartData = {
    labels: ['Skills'],
    datasets: [
      {
        label: 'Your Matching Skills',
        data: [results ? results.matchedSkills.length : 0],
        backgroundColor: 'rgba(56, 189, 248, 0.6)',
        borderColor: 'rgba(56, 189, 248, 1)',
        borderWidth: 1,
      },
      {
        label: 'Skills to Learn',
        data: [results ? results.missingSkills.length : 0],
        backgroundColor: 'rgba(244, 113, 116, 0.6)',
        borderColor: 'rgba(244, 113, 116, 1)',
        borderWidth: 1,
      }
    ]
  };
  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: 'var(--text-main)' } } },
    scales: {
      y: { ticks: { color: 'var(--text-secondary)', stepSize: 1 } },
      x: { ticks: { color: 'var(--text-secondary)' } }
    }
  };

  // Render a loading screen while checking for a user
  if (authLoading) {
    return <div className="LoadingScreen"><h1>Loading...</h1></div>;
  }

  // If no user is logged in, show the Auth component
  if (!user) {
    return <Auth />;
  }

  // If a user IS logged in, show our main app
  return (
    <div className="App">
      <nav className="Navbar">
        <div className="Logo">Career Path AI</div>
        <div className="ProfileContainer">
          <div className="ProfileIcon" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {getInitial(user.email)}
          </div>
          {isDropdownOpen && (
            <div className="DropdownMenu">
              <div className="DropdownItem UserEmail">{user.email}</div>
              <div className="DropdownItem LogoutButton" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </nav>

      <header className="App-header">
        <h1>Learning Pathway Dashboard</h1>

        <div className="ToolContainer">
          <div className="InputGroup">
            <label htmlFor="job-query">1. Enter a Job Role to Analyze:</label>
            <input type="text" id="job-query" placeholder="e.g., React Developer in Bengaluru" value={jobQuery} onChange={e => setJobQuery(e.target.value)} />
          </div>
          <div className="InputGroup">
            <label htmlFor="user-text">2. Paste Your Resume Snippet or Skills Description:</label>
            <textarea id="user-text" rows="5" placeholder="e.g., I am a skilled developer with experience in React, TypeScript, and Node.js..." value={userText} onChange={e => setUserText(e.target.value)} />
          </div>
          <button onClick={handleAnalyze} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Skill Gap'}</button>
          {error && <p className="ErrorMessage">{error}</p>}
        </div>

        {results && (
          <div className="ResultsContainer">
            <h2>Analysis for: {results.jobTitle}</h2>
            <div className="ChartContainer">
              <Bar options={chartOptions} data={chartData} />
            </div>
            <div className="Results">
              <div className="ResultSection">
                <h3>✅ Your Matching Skills ({results.matchedSkills.length})</h3>
                <ul>
                  {results.matchedSkills.length > 0 ?
                    results.matchedSkills.map(skill => <li key={skill}>{skill}</li>) :
                    <li>No matching skills found.</li>
                  }
                </ul>
              </div>
              <div className="ResultSection">
                <h3>🎯 Skills to Learn ({results.missingSkills.length})</h3>
                <ul>
                  {results.missingSkills.length > 0 ?
                    results.missingSkills.map(({ skill, url }) => (
                      <li key={skill}>
                        {skill}
                        {url && <a href={url} target="_blank" rel="noopener noreferrer">Learn</a>}
                      </li>
                    )) :
                    <li>You have all the required skills!</li>
                  }
                </ul>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;