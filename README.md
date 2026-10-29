# Live Weather Dashboard

A sleek, responsive web application built with JavaScript, HTML, and CSS that provides real-time weather data tracking, thus features a dual-page system enabling users to search for cities globally, view current, and maintain a list of bookmarked favorites across browser sessions.

## 🌟 Key Features

* **Real-Time Weather Ingestion:** Connects directly with external climate API structures to fetch accurate weather conditions and metrics.
* **Dual-Page Path Routing:** Agnostic directory structure handling that smoothly shifts state and routing contexts between the main dashboard (`index.html`) and saved favorites view (`favorites.html`).
* **Persistent Favorites Infrastructure:** Integrates localized `localStorage` payload serialization to dynamically add, verify, and deduplicate favorite locations.
* **Failsafe Error Resilience:** Robust parameter validation engines that gracefully catch and display 401 (authentication), 404 (not found), and cross-origin network exceptions.
* **Sandbox Simulation Engine:** Built-in offline testing switch (`IS_SIMULATION_MODE`) allowing rapid UI styling, testing, and micro-interaction development with randomized mock metrics.
* **Modern UI Aesthetics:** Polished glassmorphism cards featuring backdrop-filter blurs, smooth transition animations, and responsive flexbox alignment profiles.

## 📁 Repository Structure

```text
Live-Weather-Dashboard
│
├── index.html          # Main landing dashboard 
├── favorites.html      # Bookmarked locations layout
├── script.js           # Core API pipelines, data models, and storage engines
└── style.css           # Designs and responsive styles
```

## 🛠️ Technical Stack & Architecture

* **Frontend Structure:** HTML Semantic Markup
* **Design Engine:** CSS3Custom Properties, Flexbox, Transitions
* **Logic & Runtime:**  JavaScript, Await Fetch API, Event Delegation Pattern
* **Data Storage Layer:** LocalStorage 
* **API Framework:** Compatible with OpenWeather

## 🚀 Installation & Local Deployment

To run this project locally without running into browser cross-origin policy blockages, it is highly recommended to deploy via a local development environment.

1. **Clone the Repository:**
   ```bash
   git clone https://github.com
   cd Live-Weather-Dashboard
   ```

2. **Configure API Access:**
   * Open `script.js` in your editor.
   * Locate the `apiKey` variable inside the `handleWeatherSearch` function.
   * Replace the placeholder string with your 32-character OpenWeather API credentials.

3. **Launch the Live Server:**
   * Open the project folder inside **VS Code**.
   * Click the **"Go Live"** button in the bottom status bar (powered by the Live Server extension).
   * Your browser will automatically launch the project at `http://127.0.0.1:5500`.

## 🧪 Development & Offline Simulation

The application contains a developer configuration switch to bypass server rate limits or activation latencies:

```javascript
// Located near the top of script.js
const IS_SIMULATION_MODE = true; // Set to true for offline mock testing; false for live data
```
When enabled, the search form generates randomized, realistic temperatures and weather conditions, allowing full testing of the data-binding card and favorite storage layer without an internet connection.

## 📜 Development Logs & Version History

This project features a granular, professional git commit history mapping out its architecture:
* **`feat(core):`** Established layout routing and primary DOM tree node selectors.
* **`fix(api):`** Resolved geocoding entry index offsets and parameter input parsing.
* **`fix(csp):`** Reconfigured Content Security Policies to authorize outside resource streams.
* **`feat(storage):`** Engineered duplicate blocker systems and event delegation handlers for bookmark state removal.
*
