// ==========================================================================
// 1. GLOBAL ELEMENT SELECTORS MATCHING YOUR HTML NODES
// ==========================================================================
const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const favoritesList = document.getElementById("favorites-list");

// Core runtime memory tracker holding active city fields
let activeCityPayload = null;

// ==========================================================================
// 2. ENTRY ROUTINE / ROUTER (Detects current page viewport automatically)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Look at browser path to figure out what page is active
    const activeView = window.location.pathname.split("/").pop();

    // TARGET: Homepage Dashboard Logic
    if (activeView === "index.html" || activeView === "") {
        if (weatherForm) {
            weatherForm.addEventListener("submit", (e) => {
                e.preventDefault(); // Stop standard form refresh submissions
                handleWeatherLookup();
            });
        }

        // COLD LOAD CHECK: Recover last searched item from browser history instantly
        const cache = localStorage.getItem("lastWeatherCache");
        if (cache) {
            activeCityPayload = JSON.parse(cache);
            renderWeatherUI(activeCityPayload);
        }
    }

    // TARGET: Bookmarked Cities Management Panel
    if (activeView === "favorites.html") {
        renderFavoritesPanel();
    }
});

// ==========================================================================
// 3. ASYNCHRONOUS OPEN-METEO MULTI-STEP LOOKUP PIPELINE
// ==========================================================================
async function handleWeatherLookup() {
    const inputString = cityInput.value.trim();
    if (!inputString) return;

    // Phase A: Use Open-Meteo Geocoding to turn typed text into geographic coordinates
    const geoEndpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputString)}&count=1&language=en&format=json`;

    try {
        const geoResponse = await fetch(geoEndpoint);
        if (!geoResponse.ok) throw new Error("Geocoding locator tracking offline.");
        
        const geoData = await geoResponse.json();
        
        // Return alert if misspelled or invalid city
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not discovered globally. Please check spelling.");
        }

        const { latitude, longitude, name, country, country_code } = geoData.results[0];

        // Phase B: Immediately call Open-Meteo metrics endpoint using discovered coordinates
        const weatherEndpoint = `https://open-meteo.com{latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`;

        const weatherResponse = await fetch(weatherEndpoint);
        if (!weatherResponse.ok) throw new Error("Meteo data streaming server failure.");

        const weatherData = await weatherResponse.json();
        const currentData = weatherData.current;

        // Map numerical WMO systems down to readable sky summaries
        const wmoMap = {
            0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Foggy", 51: "Light drizzle", 53: "Moderate drizzle", 61: "Slight rain",
            63: "Moderate rain", 65: "Heavy rain", 71: "Slight snow", 95: "Thunderstorm"
        };
        const skySummary = wmoMap[currentData.weather_code] || "Variable conditions";

        // Standardize output properties to populate fields securely
        activeCityPayload = {
            city: name,
            country: country_code || country,
            temp: Math.round(currentData.temperature_2m),
            desc: skySummary,
            humidity: currentData.relative_humidity_2m,
            wind: currentData.wind_speed_10m
        };

        // Cache parameters to storage string elements
        localStorage.setItem("lastWeatherCache", JSON.stringify(activeCityPayload));
        
        renderWeatherUI(activeCityPayload);
        cityInput.value = ""; // Clear out searching bars cleanly

    } catch (err) {
        showCardError(err.message);
    }
}

// ==========================================================================
// 4. UI STRUCTURAL RENDERING (Uses target classes from your style.css files)
// ==========================================================================
function renderWeatherUI(payload) {
    if (!card) return;

    card.innerHTML = ""; // Wipe previous visual data wrappers cleanly
    
    // Inject node layout text strings dynamically using your CSS styles
    card.innerHTML = `
        <h2 class="cityDisplay" style="margin-top: 10px;">📍 ${payload.city}, ${payload.country.toUpperCase()}</h2>
        <div class="tempDisplay" style="font-size: 4rem; font-weight: bold; margin: 10px 0;">${payload.temp}°C</div>
        <p class="descriptionDisplay" style="font-style: italic; color: #555; margin-bottom: 15px;">${payload.desc}</p>
        
        <div style="display: flex; justify-content: space-around; width: 100%; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
            <div class="humidityDisplay">💧 Humidity: <b>${payload.humidity}%</b></div>
            <div style="color: #2d3436;">💨 Wind: <b>${payload.wind} km/h</b></div>
        </div>
        
        <button id="add-bookmark-trigger" style="margin-top: 20px; padding: 8px 16px; background: #fff9db; color: #f59f00; border: 1px solid #ffe3e3; border-radius: 20px; font-weight: bold; cursor: pointer;">⭐ Bookmark Location</button>
    `;

    card.style.display = "flex"; // Swap visibility to active block/flex layouts

    // Bind event bookmark loop onto newly generated button target
    document.getElementById("add-bookmark-trigger").addEventListener("click", commitLocationToBookmarks);
}

function showCardError(message) {
    if (!card) return;
    card.innerHTML = `<p class="errorDisplay" style="color: red; font-weight: bold; padding: 1rem;">⚠️ ${message}</p>`;
    card.style.display = "flex";
}

// ==========================================================================
// 5. STORAGE ARRAYS PROCESSING MECHANICS (LocalStorage Management)
// ==========================================================================
function commitLocationToBookmarks() {
    if (!activeCityPayload) return;

    let bookmarkArray = JSON.parse(localStorage.getItem("favoriteCities")) || [];

    // Duplication defense interceptor loop
    const duplicateMatch = bookmarkArray.some(item => item.name.toLowerCase() === activeCityPayload.city.toLowerCase());
    if (duplicateMatch) {
        alert(`${activeCityPayload.city} is already saved inside your shortcuts.`);
        return;
    }

    // Append minimal structural tracking parameters needed to refetch on click
    bookmarkArray.push({
        name: activeCityPayload.city,
        country: activeCityPayload.country
    });

    localStorage.setItem("favoriteCities", JSON.stringify(bookmarkArray));
    alert(`${activeCityPayload.city} pinned successfully to your favorites list!`);
}

function renderFavoritesPanel() {
    if (!favoritesList) return;

    const savedItems = JSON.parse(localStorage.getItem("favoriteCities")) || [];
    favoritesList.innerHTML = ""; // Clear placeholder rows

    if (savedItems.length === 0) {
        favoritesList.innerHTML = `<p style="text-align: center; color: #b2bec3; padding: 2rem 0;">No shortcuts saved yet. Explore the dashboard to bookmark locations.</p>`;
        return;
    }

    // Create a row node for each saved bookmarked city entry
    savedItems.forEach((item, index) => {
        const row = document.createElement("div");
        
        // Style parameters matching a premium item layout card row
        row.style.cssText = "background: #f8f9fa; border: 2px solid #edf2f7; padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;";
        
        row.innerHTML = `
            <span style="font-weight: bold; color: #2d3436;">📍 ${item.name}, ${item.country.toUpperCase()}</span>
            <button class="remove-btn" data-id="${index}" style="background: #ffe3e3; color: #e03131; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">Remove</button>
        `;

        // Row navigation redirection: click moves back to home view to force load weather stats
        row.addEventListener("click", (e) => {
            if (e.target.classList.contains("remove-btn")) return; // Guard clause against deletion clicks
            localStorage.setItem("routeLoadTarget", item.name);
            window.location.href = "index.html";
        });

        // Delete trigger binding workflow
        row.querySelector(".remove-btn").addEventListener("click", (e) => {
            e.stopPropagation(); // Halt bubbling events from triggering page links redirects
            const targetId = e.target.getAttribute("data-id");
            let items = JSON.parse(localStorage.getItem("favoriteCities")) || [];
            
            items.splice(targetId, 1); // Extract selection index matches
            localStorage.setItem("favoriteCities", JSON.stringify(items));
            renderFavoritesPanel(); // Rerender display dashboard dynamically
        });

        favoritesList.appendChild(row);
    });
}

// REDIRECTION INTERCEPTOR OVERRIDE ROUTINE: Auto-runs searches passed from page two
const routeRequest = localStorage.getItem("routeLoadTarget");
if (routeRequest && cityInput) {
    cityInput.value = routeRequest;
    handleWeatherLookup();
    localStorage.removeItem("routeLoadTarget");
}