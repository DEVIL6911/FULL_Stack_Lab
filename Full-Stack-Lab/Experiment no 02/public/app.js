const API_BASE = '';

let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 15;
let quizStartTime = 0;
let totalQuizTime = 0;

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        showSection(section);
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    if (sectionName === 'leaderboard') {
        loadLeaderboard();
    }
}

// Quiz Logic
document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
document.getElementById('playAgainBtn').addEventListener('click', resetQuiz);
document.getElementById('viewLeaderboardBtn').addEventListener('click', () => {
    showSection('leaderboard');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-section="leaderboard"]').classList.add('active');
});

async function startQuiz() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/quiz/questions`);
        quizQuestions = await response.json();
        currentQuestionIndex = 0;
        score = 0;
        totalQuizTime = 0;

        document.getElementById('quizSetup').classList.add('hidden');
        document.getElementById('quizActive').classList.remove('hidden');
        document.getElementById('totalQ').textContent = quizQuestions.length;

        loadQuestion();
    } catch (err) {
        console.error('Failed to load questions:', err);
        alert('Failed to load quiz questions. Please try again.');
    }
}

function loadQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        endQuiz();
        return;
    }

    const q = quizQuestions[currentQuestionIndex];
    document.getElementById('currentQ').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = q.question;
    document.getElementById('liveScore').textContent = score;

    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => selectAnswer(idx, btn));
        grid.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 15;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timerText').textContent = timeLeft;
    const circle = document.getElementById('timerCircle');
    const offset = 283 - (283 * timeLeft) / 15;
    circle.style.strokeDashoffset = offset;
    
    if (timeLeft <= 5) {
        circle.style.stroke = '#ef4444';
        document.getElementById('timerText').style.color = '#ef4444';
    } else {
        circle.style.stroke = '#ec4899';
        document.getElementById('timerText').style.color = '#ec4899';
    }
}

function selectAnswer(selectedIndex, btn) {
    clearInterval(timerInterval);
    const q = quizQuestions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    if (selectedIndex === q.correct) {
        btn.classList.add('correct');
        score++;
        document.getElementById('liveScore').textContent = score;
    } else {
        btn.classList.add('wrong');
        buttons[q.correct].classList.add('correct');
    }

    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 1200);
}

function timeUp() {
    const q = quizQuestions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);
    buttons[q.correct].classList.add('correct');

    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 1500);
}

async function endQuiz() {
    clearInterval(timerInterval);
    totalQuizTime = Math.round((Date.now() - quizStartTime) / 1000);

    document.getElementById('quizActive').classList.add('hidden');
    document.getElementById('quizResult').classList.remove('hidden');

    const total = quizQuestions.length;
    const accuracy = Math.round((score / total) * 100);
    
    document.getElementById('finalScore').textContent = `${score}/${total}`;
    document.getElementById('finalTime').textContent = `${totalQuizTime}s`;
    document.getElementById('finalAccuracy').textContent = `${accuracy}%`;

    let emoji = '😢';
    if (accuracy >= 90) emoji = '🏆';
    else if (accuracy >= 70) emoji = '🌟';
    else if (accuracy >= 50) emoji = '👍';
    else if (accuracy >= 30) emoji = '📚';
    document.getElementById('resultEmoji').textContent = emoji;

    const playerName = document.getElementById('playerName').value.trim();
    try {
        await fetch(`${API_BASE}/api/leaderboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player_name: playerName,
                score: score,
                total_questions: total,
                time_taken: totalQuizTime
            })
        });
    } catch (err) {
        console.error('Failed to save score:', err);
    }
}

function resetQuiz() {
    document.getElementById('quizResult').classList.add('hidden');
    document.getElementById('quizSetup').classList.remove('hidden');
    document.getElementById('playerName').value = '';
}

// Leaderboard
async function loadLeaderboard() {
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '<div class="loading">Loading leaderboard...</div>';

    try {
        const response = await fetch(`${API_BASE}/api/leaderboard`);
        const scores = await response.json();

        if (scores.length === 0) {
            list.innerHTML = '<div class="empty-state">No scores yet. Be the first to play!</div>';
            return;
        }

        list.innerHTML = scores.map((entry, idx) => {
            let rankClass = '';
            if (idx === 0) rankClass = 'gold';
            else if (idx === 1) rankClass = 'silver';
            else if (idx === 2) rankClass = 'bronze';

            const date = new Date(entry.created_at).toLocaleDateString();
            const accuracy = Math.round((entry.score / entry.total_questions) * 100);

            return `
                <div class="table-row">
                    <span class="rank ${rankClass}">${idx + 1}</span>
                    <span class="player-name">${entry.player_name}</span>
                    <span class="score-cell">${entry.score}/${entry.total_questions} (${accuracy}%)</span>
                    <span class="time-cell">${entry.time_taken}s</span>
                    <span class="date-cell">${date}</span>
                </div>
            `;
        }).join('');
    } catch (err) {
        list.innerHTML = '<div class="empty-state">Failed to load leaderboard.</div>';
    }
}

document.getElementById('refreshLeaderboard').addEventListener('click', loadLeaderboard);

// Weather
document.getElementById('searchWeatherBtn').addEventListener('click', searchWeather);
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});

async function searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return;

    const content = document.getElementById('weatherContent');
    const error = document.getElementById('weatherError');
    
    content.classList.add('hidden');
    error.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (data.demo || response.ok) {
            if (!response.ok) {
                showWeatherError(data.error || 'City not found');
                return;
            }
            displayWeather(data);
        } else {
            showWeatherError(data.error || 'Failed to fetch weather');
        }
    } catch (err) {
        showWeatherError('Failed to connect to weather service');
    }
}

function displayWeather(data) {
    document.getElementById('weatherCity').textContent = data.geminiPowered ? `${data.city} (AI Generated)` : `${data.city}, ${data.country}`;
    document.getElementById('weatherDesc').textContent = data.description;
    document.getElementById('weatherTemp').textContent = `${Math.round(data.temp)}°C`;
    document.getElementById('weatherFeels').textContent = `${Math.round(data.feels_like)}°C`;
    document.getElementById('weatherHumidity').textContent = `${data.humidity}%`;
    document.getElementById('weatherWind').textContent = `${data.wind} m/s`;
    
    if (data.geminiPowered) {
        document.getElementById('weatherIcon').textContent = data.icon || '🤖';
    } else {
        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        document.getElementById('weatherIcon').textContent = iconMap[data.icon] || '🌤️';
    }
    
    document.getElementById('weatherContent').classList.remove('hidden');
}

function showWeatherError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('weatherError').classList.remove('hidden');
}

// AI Chat
document.getElementById('aiSendBtn').addEventListener('click', sendAIMessage);
document.getElementById('aiInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendAIMessage();
});

async function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    if (!message) return;

    const chat = document.getElementById('aiChat');
    
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user-message';
    userMsg.innerHTML = `<p>${message}</p>`;
    chat.appendChild(userMsg);
    
    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'ai-message';
    loadingMsg.innerHTML = '<span class="ai-avatar">🤖</span><p>Thinking...</p>';
    chat.appendChild(loadingMsg);
    chat.scrollTop = chat.scrollHeight;

    try {
        const response = await fetch(`${API_BASE}/api/gemini`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Weather context: ${message}` })
        });
        const data = await response.json();
        
        chat.removeChild(loadingMsg);
        
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-message';
        aiMsg.innerHTML = `<span class="ai-avatar">🤖</span><p>${data.reply}</p>`;
        chat.appendChild(aiMsg);
        chat.scrollTop = chat.scrollHeight;
    } catch (err) {
        chat.removeChild(loadingMsg);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'ai-message';
        errorMsg.innerHTML = '<span class="ai-avatar">🤖</span><p>Sorry, I could not connect. Please check API configuration.</p>';
        chat.appendChild(errorMsg);
    }
}

// Initialize leaderboard on load
loadLeaderboard();
