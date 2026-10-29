const searchForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");

const favoritesContainer = document.querySelector(".favorites-list") || document.getElementById("favorites-list");

const IS_SIMULATION_MODE = true; 


document.addEventListener("DOMContentLoaded", () => {
    const currentUrlString = window.location.href.toLowerCase();
    
    if (currentUrlString.includes("favorites")) {
        console.log("📂 Favorites route path verified active.");
        renderFavoritesPage();
    } else {
        console.log("🏠 Dashboard home route active.");
        if (searchForm) {
            searchForm.addEventListener("submit", handleWeatherSearch);
        }
    }
});

async function handleWeatherSearch(e) {
    e.preventDefault();
    
    const inputString = cityInput.value.trim();
    if (!inputString) {
        showError("Please enter a city name first.");
        return;
    }

    if (IS_SIMULATION_MODE) {
        const randomTemp = Math.floor(Math.random() * (32 - 12 + 1)) + 12; 
        const conditions = ["Clear Sky", "Partly Cloudy", "Heavy Rain", "Thunderstorm"];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

        const mockData = {
            id: Math.floor(Math.random() * 1000000), // Unique ID generator
            name: inputString.charAt(0).toUpperCase() + inputString.slice(1),
            main: { temp: randomTemp },
            weather: { main: randomCondition }
        };

        localStorage.setItem("lastSearchedCity", JSON.stringify(mockData));
        renderWeatherCard(mockData);
        return; 
    }

    
    const apiKey = "YOUR_OPENWEATHER_API_KEY"; 
    const url = `https://openweathermap.org{encodeURIComponent(inputString)}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            showError("City lookup resolution failed.");
            return;
        }
        const weatherData = await response.json();
        const structuredWeatherData = {
            id: weatherData.id || Date.now(), 
            name: weatherData.name,
            main: { temp: weatherData.main ? weatherData.main.temp : 0 },
            weather: { main: weatherData.weather ? weatherData.weather[0].main : "Variable" }
        };

        localStorage.setItem("lastSearchedCity", JSON.stringify(structuredWeatherData));
        renderWeatherCard(structuredWeatherData);
    } catch (error) {
        showError("Network exception encountered.");
    }
}

function renderWeatherCard(data) {
    if (!card) return;

    const condition = data.weather.main; 
    const temp = Math.round(data.main.temp);
    const cityName = data.name;

    card.innerHTML = `
        <h1 class="cityDisplay" style="color: #ffffff; font-size: 2.2rem; margin-bottom: 5px;">${cityName}</h1>
        <p class="tempDisplay" style="color: #ffffff; font-size: 3rem; font-weight: bold;">${temp}°C</p>
        <p class="descDisplay" style="text-transform: capitalize; color: #f0f0f0; margin-top: 5px; font-size: 1.2rem;">${condition}</p>
        
        <button id="add-bookmark-trigger" type="button" style="margin-top: 20px; padding: 10px 20px; border-radius: 6px; cursor: pointer; background-color: rgba(255, 255, 255, 0.25); color: white; border: 1px solid rgba(255, 255, 255, 0.4); font-weight: bold; font-size: 0.95rem; backdrop-filter: blur(5px);">
            ⭐ Favorite City
        </button>
    `;
    
    card.style.display = "flex";
    document.getElementById("add-bookmark-trigger").addEventListener("click", saveCurrentToBookmarks);
}

function showError(message) {
    if (card) {
        card.innerHTML = `<p class="error-display" style="font-weight: bold; color: #ff4d4d; background: rgba(0,0,0,0.4); padding: 10px;">⚠️ ${message}</p>`;
        card.style.display = "flex";
    }
}


function saveCurrentToBookmarks() {
    const rawData = localStorage.getItem("lastSearchedCity");
    if (!rawData) return;
    
    const currentCity = JSON.parse(rawData);
    let bookmarks = JSON.parse(localStorage.getItem("weatherBookmarks")) || [];

    // Safety deduplication check
    const exists = bookmarks.some(city => city.name.toLowerCase() === currentCity.name.toLowerCase());
    if (exists) {
        alert("This city is already in your favorites list.");
        return;
    }

    bookmarks.push(currentCity);
    localStorage.setItem("weatherBookmarks", JSON.stringify(bookmarks));
    alert(`${currentCity.name} successfully saved to bookmarks storage structure!`);
}

function renderFavoritesPage() {
    console.log("Executing favorites engine generation step...");
    const bookmarks = JSON.parse(localStorage.getItem("weatherBookmarks")) || [];
    
    if (!favoritesContainer) {
        console.error("CRITICAL ERROR: Unable to locate a structural placeholder container element (.favorites-list) in your HTML.");
        return;
    }
    
    favoritesContainer.innerHTML = "";

    if (bookmarks.length === 0) {
        favoritesContainer.innerHTML = `<p style="color: #666; font-style: italic; text-align: center; padding: 20px; width: 100%;">No bookmarks saved yet.</p>`;
        return;
    }

    bookmarks.forEach(city => {
        const item = document.createElement("div");
        item.className = "favorite-card";
        item.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.9); padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); width: 100%; max-width: 300px;";
        
        item.innerHTML = `
            <div>
                <strong style="font-size: 1.1rem; color: #333;">${city.name}</strong>
                <span style="margin-left: 15px; font-weight: bold; color: #2563eb;">${Math.round(city.main.temp)}°C</span>
            </div>
            <button class="remove-fav-btn" data-id="${city.id}" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Remove</button>
        `;
        
        favoritesContainer.appendChild(item);
    });

    favoritesContainer.replaceWith(favoritesContainer.cloneNode(true)); 
    const freshContainerRef = document.querySelector(".favorites-list") || document.getElementById("favorites-list");
    
    freshContainerRef.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-fav-btn")) {
            const cityId = parseInt(e.target.getAttribute("data-id"), 10);
            removeBookmark(cityId);
        }
    });
}

function removeBookmark(id) {
    let bookmarks = JSON.parse(localStorage.getItem("weatherBookmarks")) || [];
    bookmarks = bookmarks.filter(city => city.id !== id);
    localStorage.setItem("weatherBookmarks", JSON.stringify(bookmarks));
    renderFavoritesPage();
}


       

        

     
        

