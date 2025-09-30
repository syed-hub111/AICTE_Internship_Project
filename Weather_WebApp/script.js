// --- DOM Element References ---
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const weatherDataContainer = document.getElementById('weather-data');
const currentWeatherContainer = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecast-container');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');

// --- API Configuration ---
const API_KEY = 'd0304af97bb347dcbe9153249253009'; // Your API key
const BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';

// --- Event Listeners ---
searchForm.addEventListener('submit', handleSearch);

// --- Functions ---

/**
 * Handles the form submission to fetch weather data.
 * @param {Event} e - The form submission event.
 */
async function handleSearch(e) {
    e.preventDefault(); // Prevent page reload
    const city = cityInput.value.trim();

    if (!city) return;

    // Reset UI
    weatherDataContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const weatherData = await fetchWeatherData(city);
        displayWeatherData(weatherData);
    } catch (error) {
        showError(error.message);
    } finally {
        loader.classList.add('hidden');
        cityInput.value = '';
    }
}

/**
 * Fetches weather data from the API for a given city.
 * @param {string} city - The name of the city.
 * @returns {Promise<Object>} - The weather data.
 */
async function fetchWeatherData(city) {
    const url = `${BASE_URL}?key=${API_KEY}&q=${city}&days=5&aqi=yes&alerts=no`;
    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('City not found. Please enter a valid city name.');
        }
        throw new Error('Failed to fetch weather data. Please try again.');
    }

    return await response.json();
}

/**
 * Displays the fetched weather data on the UI.
 * @param {Object} data - The weather data object from the API.
 */
function displayWeatherData(data) {
    displayCurrentWeather(data.location, data.current);
    displayForecast(data.forecast.forecastday);
    weatherDataContainer.classList.remove('hidden');
}

/**
 * Displays the current weather conditions.
 * @param {Object} location - The location data.
 * @param {Object} current - The current weather data.
 */
function displayCurrentWeather(location, current) {
    currentWeatherContainer.innerHTML = `
        <div class="current-main">
            <h3>${location.name}, ${location.country}</h3>
            <div class="temp">${Math.round(current.temp_c)}°C</div>
            <div class="condition">
                <img src="${current.condition.icon}" alt="${current.condition.text}">
                <span>${current.condition.text}</span>
            </div>
        </div>
        <div class="current-details">
            <p><strong>Feels like:</strong> ${Math.round(current.feelslike_c)}°C</p>
            <p><strong>Wind:</strong> ${current.wind_kph} kph</p>
            <p><strong>Pressure:</strong> ${current.pressure_mb} mb</p>
            <p><strong>Humidity:</strong> ${current.humidity}%</p>
        </div>
    `;
}

/**
 * Displays the 5-day weather forecast.
 * @param {Array<Object>} forecastDays - An array of forecast day objects.
 */
function displayForecast(forecastDays) {
    forecastContainer.innerHTML = ''; // Clear previous forecast

    forecastDays.forEach(dayData => {
        const day = new Date(dayData.date);
        const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });

        const forecastDayEl = document.createElement('div');
        forecastDayEl.classList.add('forecast-day');
        forecastDayEl.innerHTML = `
            <div class="day">${dayName}</div>
            <img src="${dayData.day.condition.icon}" alt="${dayData.day.condition.text}">
            <div class="temps">
                <strong>${Math.round(dayData.day.maxtemp_c)}°</strong> / ${Math.round(dayData.day.mintemp_c)}°
            </div>
        `;
        forecastContainer.appendChild(forecastDayEl);
    });
}

/**
 * Shows an error message on the UI.
 * @param {string} message - The error message to display.
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}