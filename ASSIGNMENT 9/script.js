/* ============================================================
   Daily Dashboard - script.js
   Built feature by feature: nav, todo, planner, goals,
   pomodoro, quotes, weather, date/time, background, theme.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initTodoList();
  initPlanner();
  initGoals();
  initPomodoro();
  initQuotes();
  initWeather();
  initDateTime();
  initDynamicBackground();
  initThemeToggle();
});


/* ============================================================
   1. DASHBOARD NAVIGATION
   ============================================================ */
function initNavigation() {
  const dashboard = document.getElementById("dashboard");
  const cards = document.querySelectorAll(".feature-card");
  const backButtons = document.querySelectorAll("[data-back]");

  let activeSection = null; // tracks which feature view is currently open

  function openFeature(sectionId) {
    // guard against double clicks opening two sections at once
    if (activeSection === sectionId) return;

    const target = document.getElementById(sectionId);
    if (!target) return;

    dashboard.classList.add("hidden");
    document.querySelectorAll(".feature-view").forEach((el) => el.classList.remove("active"));
    target.classList.add("active");
    activeSection = sectionId;
  }

  function closeFeature() {
    document.querySelectorAll(".feature-view").forEach((el) => el.classList.remove("active"));
    dashboard.classList.remove("hidden");
    activeSection = null;
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => openFeature(card.dataset.target));
  });

  backButtons.forEach((btn) => {
    btn.addEventListener("click", closeFeature);
  });
}


/* ============================================================
   2. TODO LIST
   ============================================================ */
function initTodoList() {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const sub = document.getElementById("todo-sub");

  let todos = loadFromStorage("dashboard-todos", []);

  function save() {
    saveToStorage("dashboard-todos", todos);
    sub.textContent = `${todos.length} task${todos.length === 1 ? "" : "s"}`;
  }

  function render() {
    list.innerHTML = "";
    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "item-row";
      li.dataset.id = todo.id;
      if (todo.completed) li.classList.add("completed");
      if (todo.important) li.classList.add("important");

      li.innerHTML = `
        <button class="star ${todo.important ? "active" : ""}" data-action="important" title="Mark important">★</button>
        <span class="item-text" data-action="complete">${escapeHtml(todo.text)}</span>
        <button class="danger" data-action="delete" title="Delete">✕</button>
      `;
      list.appendChild(li);
    });
    save();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return; // don't add empty tasks

    todos.push({ id: Date.now(), text, completed: false, important: false });
    input.value = "";
    render();
  });

  // event delegation - one listener handles every task's buttons
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const row = btn.closest(".item-row");
    const id = Number(row.dataset.id);
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (btn.dataset.action === "complete") todo.completed = !todo.completed;
    if (btn.dataset.action === "important") todo.important = !todo.important;
    if (btn.dataset.action === "delete") todos = todos.filter((t) => t.id !== id);

    render();
  });

  render();
}


/* ============================================================
   3. DAILY PLANNER
   ============================================================ */
function initPlanner() {
  const container = document.getElementById("planner-list");
  const HOURS = Array.from({ length: 24 }, (_, h) => h); // 0..23

  let plan = loadFromStorage("dashboard-planner", {});
  let saveTimer = null;

  function formatHour(h) {
    const period = h < 12 ? "AM" : "PM";
    let display = h % 12;
    if (display === 0) display = 12;
    return `${display}:00 ${period}`;
  }

  function render() {
    const currentHour = new Date().getHours();
    container.innerHTML = "";

    HOURS.forEach((h) => {
      const row = document.createElement("div");
      row.className = "planner-row";
      if (h === currentHour) row.classList.add("current-hour");

      const label = document.createElement("span");
      label.className = "planner-time";
      label.textContent = formatHour(h);

      const field = document.createElement("input");
      field.type = "text";
      field.placeholder = "Nothing planned";
      field.value = plan[h] || ""; // handle empty slots gracefully
      field.dataset.hour = h;

      row.appendChild(label);
      row.appendChild(field);
      container.appendChild(row);
    });
  }

  // save only after the user pauses typing, not on every keystroke
  container.addEventListener("input", (e) => {
    const hour = e.target.dataset.hour;
    if (hour === undefined) return;

    if (e.target.value.trim() === "") {
      delete plan[hour];
    } else {
      plan[hour] = e.target.value;
    }

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveToStorage("dashboard-planner", plan), 400);
  });

  // re-highlight the current hour every minute in case the app stays open
  setInterval(() => {
    const currentHour = new Date().getHours();
    document.querySelectorAll(".planner-row").forEach((row, i) => {
      row.classList.toggle("current-hour", i === currentHour);
    });
  }, 60000);

  render();
}


/* ============================================================
   4. DAILY GOALS
   ============================================================ */
function initGoals() {
  const form = document.getElementById("goal-form");
  const input = document.getElementById("goal-input");
  const list = document.getElementById("goal-list");
  const progressText = document.getElementById("goal-progress");
  const cardSub = document.getElementById("goals-sub");

  let goals = loadFromStorage("dashboard-goals", []);

  function updateProgress() {
    const done = goals.filter((g) => g.completed).length;
    const total = goals.length;
    progressText.textContent = `${done} of ${total} completed`;
    cardSub.textContent = `${done} of ${total} done`;
  }

  function save() {
    saveToStorage("dashboard-goals", goals);
    updateProgress();
  }

  function render() {
    list.innerHTML = "";
    goals.forEach((goal) => {
      const li = document.createElement("li");
      li.className = "item-row";
      li.dataset.id = goal.id;
      if (goal.completed) li.classList.add("completed");

      li.innerHTML = `
        <input type="checkbox" data-action="toggle" ${goal.completed ? "checked" : ""}>
        <span class="item-text">${escapeHtml(goal.text)}</span>
        <button class="danger" data-action="delete" title="Delete">✕</button>
      `;
      list.appendChild(li);
    });
    save();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    goals.push({ id: Date.now(), text, completed: false });
    input.value = "";
    render();
  });

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const row = btn.closest(".item-row");
    const id = Number(row.dataset.id);

    if (btn.dataset.action === "delete") {
      goals = goals.filter((g) => g.id !== id);
      render();
    }
  });

  // checkbox change is separate from click since it's its own event
  list.addEventListener("change", (e) => {
    if (e.target.dataset.action !== "toggle") return;
    const row = e.target.closest(".item-row");
    const id = Number(row.dataset.id);
    const goal = goals.find((g) => g.id === id);
    if (goal) goal.completed = e.target.checked;
    render();
  });

  render();
}


/* ============================================================
   5. POMODORO TIMER
   ============================================================ */
function initPomodoro() {
  const WORK_SECONDS = 25 * 60;
  const BREAK_SECONDS = 5 * 60;

  const display = document.getElementById("pomodoro-display");
  const label = document.getElementById("pomodoro-label");
  const startBtn = document.getElementById("pomodoro-start");
  const pauseBtn = document.getElementById("pomodoro-pause");
  const resetBtn = document.getElementById("pomodoro-reset");

  let secondsLeft = WORK_SECONDS;
  let isBreak = false;
  let intervalId = null; // keep a handle so we never stack intervals

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function render() {
    display.textContent = formatTime(secondsLeft);
    label.textContent = isBreak ? "Break Time" : "Work Session";
  }

  function tick() {
    secondsLeft--;
    if (secondsLeft <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      notifySessionEnd();

      // switch session type and wait for the user to start the next one
      isBreak = !isBreak;
      secondsLeft = isBreak ? BREAK_SECONDS : WORK_SECONDS;
    }
    render();
  }

  function notifySessionEnd() {
    // simple in-page alert so it works with no extra permissions
    alert(isBreak ? "Work session done - time for a break!" : "Break's over - back to work!");
  }

  startBtn.addEventListener("click", () => {
    if (intervalId) return; // already running, don't stack a second interval
    intervalId = setInterval(tick, 1000);
  });

  pauseBtn.addEventListener("click", () => {
    clearInterval(intervalId);
    intervalId = null;
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(intervalId);
    intervalId = null;
    isBreak = false;
    secondsLeft = WORK_SECONDS;
    render();
  });

  render();
}


/* ============================================================
   6. MOTIVATION QUOTES
   ============================================================ */
function initQuotes() {
  // local quote bank instead of a third-party API - no signup, no API key,
  // and no risk of the widget breaking if some free API goes offline
  const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Well done is better than well said.", author: "Benjamin Franklin" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma" },
    { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  ];

  const textEl = document.getElementById("quote-text");
  const authorEl = document.getElementById("quote-author");
  const btn = document.getElementById("quote-btn");

  let lastIndex = -1;

  // wrapped in a promise with a small delay to mimic a real network
  // request, so the loading state actually has something to show
  function getRandomQuote() {
    return new Promise((resolve) => {
      setTimeout(() => {
        let index;
        do {
          index = Math.floor(Math.random() * QUOTES.length);
        } while (index === lastIndex && QUOTES.length > 1);
        lastIndex = index;
        resolve(QUOTES[index]);
      }, 400);
    });
  }

  async function showNewQuote() {
    btn.disabled = true;
    textEl.textContent = "Loading a new quote…";
    authorEl.textContent = "";

    try {
      const quote = await getRandomQuote();
      textEl.textContent = `"${quote.text}"`;
      authorEl.textContent = `- ${quote.author}`;
    } catch (err) {
      textEl.textContent = "Couldn't load a quote right now. Try again.";
    } finally {
      btn.disabled = false;
    }
  }

  btn.addEventListener("click", showNewQuote);
}


/* ============================================================
   7. WEATHER WIDGET (Open-Meteo - free, no API key needed)
   ============================================================ */
function initWeather() {
  const body = document.getElementById("weather-body");
  const refreshBtn = document.getElementById("weather-refresh");

  // rough condition text for Open-Meteo's numeric weather codes
  const WEATHER_CODES = {
    0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Foggy",
    51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain",
    71: "Light snow", 73: "Snow", 75: "Heavy snow",
    80: "Rain showers", 81: "Rain showers", 82: "Violent showers",
    95: "Thunderstorm",
  };

  function renderLoading() {
    body.innerHTML = `<p class="weather-status">Loading weather…</p>`;
  }

  function renderError(message) {
    body.innerHTML = `<p class="weather-status">${escapeHtml(message)}</p>`;
  }

  function renderWeather(data, placeName) {
    const condition = WEATHER_CODES[data.weather_code] || "Unknown";
    body.innerHTML = `
      <div class="weather-main">
        <span class="weather-temp">${Math.round(data.temperature_2m)}°C</span>
        <span class="weather-condition">${escapeHtml(condition)}</span>
      </div>
      <p class="weather-status">${escapeHtml(placeName)}</p>
      <div class="weather-details">
        <span>💧 ${data.relative_humidity_2m}% humidity</span>
        <span>💨 ${Math.round(data.wind_speed_10m)} km/h</span>
      </div>
    `;
  }

  async function fetchWeather(lat, lon, placeName) {
    renderLoading();
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather request failed");
      const data = await response.json();
      renderWeather(data.current, placeName);
    } catch (err) {
      renderError("Couldn't load weather right now.");
    }
  }

  function loadWeatherForLocation() {
    if (!navigator.geolocation) {
      // fixed fallback city if geolocation isn't supported at all
      fetchWeather(28.6139, 77.2090, "New Delhi (default)");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude, "Your location");
      },
      () => {
        // user denied location access - fall back to a default city
        fetchWeather(28.6139, 77.2090, "New Delhi (default)");
      },
      { timeout: 8000 }
    );
  }

  refreshBtn.addEventListener("click", loadWeatherForLocation);
  loadWeatherForLocation();
}


/* ============================================================
   8. DATE & TIME DISPLAY
   ============================================================ */
function initDateTime() {
  const timeText = document.getElementById("time-text");
  const dateText = document.getElementById("date-text");

  function update() {
    const now = new Date();

    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const date = now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });

    timeText.textContent = time;
    dateText.textContent = date;
  }

  update(); // run immediately so it doesn't wait a full second to appear
  setInterval(update, 1000);
}


/* ============================================================
   9. DYNAMIC BACKGROUND (time-of-day based)
   ============================================================ */
function initDynamicBackground() {
  const BACKGROUNDS = {
    morning: "linear-gradient(180deg, #fdf1d6 0%, #f2f4f7 100%)",
    afternoon: "linear-gradient(180deg, #eaf3fb 0%, #f2f4f7 100%)",
    evening: "linear-gradient(180deg, #fbe3d6 0%, #f2f4f7 100%)",
    night: "linear-gradient(180deg, #1b1e2b 0%, #14161c 100%)",
  };

  function getTimeOfDay(hour) {
    if (hour >= 5 && hour < 11) return "morning";
    if (hour >= 11 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night"; // covers 21-23 and 0-4, no gaps
  }

  function applyBackground() {
    // skip while dark theme is active, let the theme's own colors show instead
    if (document.documentElement.getAttribute("data-theme") === "dark") {
      document.body.style.background = "";
      return;
    }
    const period = getTimeOfDay(new Date().getHours());
    document.body.style.background = BACKGROUNDS[period];
  }

  applyBackground();
  // re-check every 10 minutes in case the app stays open across a boundary
  setInterval(applyBackground, 10 * 60 * 1000);

  // exposed so the theme toggle can re-run this after switching themes
  window.__applyDynamicBackground = applyBackground;
}


/* ============================================================
   10. THEME SWITCH (light/dark)
   ============================================================ */
function initThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const root = document.documentElement;

  function applyIcon() {
    const isDark = root.getAttribute("data-theme") === "dark";
    toggle.textContent = isDark ? "☀️" : "🌙";
  }

  toggle.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      localStorage.setItem("dashboard-theme", "light");
    } else {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("dashboard-theme", "dark");
    }
    applyIcon();
    if (window.__applyDynamicBackground) window.__applyDynamicBackground();
  });

  applyIcon();
}


/* ============================================================
   HELPERS
   ============================================================ */
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // storage might be full or disabled - fail quietly, app still works in-session
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}