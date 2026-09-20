require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./quizapp.db', (err) => {
  if (err) console.error('SQLite connection error:', err.message);
  else console.log('Connected to SQLite database');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_taken INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.get('/api/leaderboard', (req, res) => {
  db.all(
    'SELECT * FROM leaderboard ORDER BY score DESC, time_taken ASC LIMIT 50',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/api/leaderboard', (req, res) => {
  const { player_name, score, total_questions, time_taken } = req.body;
  if (!player_name || score === undefined || !total_questions || time_taken === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'INSERT INTO leaderboard (player_name, score, total_questions, time_taken) VALUES (?, ?, ?, ?)',
    [player_name, score, total_questions, time_taken],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Score saved' });
    }
  );
});

app.get('/api/quiz/questions', (req, res) => {
  const questions = [
    { id: 1, question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
    { id: 2, question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
    { id: 3, question: "What is 2 + 2 * 2?", options: ["6", "8", "4", "10"], correct: 0 },
    { id: 4, question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], correct: 2 },
    { id: 5, question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
    { id: 6, question: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
    { id: 7, question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2 },
    { id: 8, question: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], correct: 2 },
    { id: 9, question: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Gazelle", "Horse"], correct: 1 },
    { id: 10, question: "Which language is used for web development?", options: ["Python", "HTML", "C++", "Java"], correct: 1 }
  ];
  res.json(questions);
});

app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'City is required' });

  const weatherApiKey = process.env.WEATHER_API_KEY;
  
  if (weatherApiKey && weatherApiKey !== 'your_openweather_api_key_here') {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${weatherApiKey}`
      );
      const data = await response.json();
      if (response.ok) {
        return res.json({
          city: data.name,
          country: data.sys.country,
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          humidity: data.main.humidity,
          description: data.weather[0].description,
          wind: data.wind.speed,
          icon: data.weather[0].icon
        });
      }
    } catch (err) {
      console.error('Weather API failed, falling back to Gemini:', err.message);
    }
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    return res.json({ 
      city: city,
      country: 'Sample',
      temp: 24,
      feels_like: 25,
      humidity: 55,
      description: 'Partly Cloudy (Demo Mode: set WEATHER_API_KEY in .env for live data)',
      wind: 4.5,
      icon: '02d',
      note: 'No weather API configured. Add WEATHER_API_KEY or GEMINI_API_KEY to .env file.',
      demo: true 
    });
  }

  try {
    const prompt = `Provide current weather information for ${city}. Include temperature, humidity, wind speed, and weather conditions. Format as JSON with fields: temp, feels_like, humidity, wind, description, icon (use emoji). Be concise and realistic.`;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    const part = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0];
    const geminiText = part ? part.text : null;
    
    if (geminiText) {
      const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const weatherData = JSON.parse(jsonMatch[0]);
          return res.json({
            city: city,
            country: '',
            temp: weatherData.temp || 25,
            feels_like: weatherData.feels_like || 27,
            humidity: weatherData.humidity || 60,
            description: weatherData.description || 'partly cloudy',
            wind: weatherData.wind || 12,
            icon: weatherData.icon || '⛅',
            geminiPowered: true
          });
        } catch (e) {}
      }
      
      return res.json({
        city: city,
        country: '',
        temp: 25,
        feels_like: 27,
        humidity: 60,
        description: geminiText.substring(0, 100),
        wind: 12,
        icon: '⛅',
        geminiPowered: true
      });
    }
    
    res.status(500).json({ error: 'Could not generate weather data' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.post('/api/gemini', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.json({ 
      reply: "Gemini API key not configured. Add GEMINI_API_KEY to .env file to enable AI chat." 
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );
    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    const part = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0];
    const reply = part ? part.text : "No response";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: "Error connecting to Gemini API" });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
